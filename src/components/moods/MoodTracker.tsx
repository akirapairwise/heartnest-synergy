
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Heart, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';
import { useDailyMood, MoodEntry } from '@/hooks/useDailyMood';

const moodLabels = ["Struggling", "Disconnected", "Neutral", "Connected", "Thriving"];
const moodDescriptions = [
  "Feeling distant and experiencing conflict",
  "Not feeling very connected, communication is difficult",
  "Ok but could be better, some ups and downs",
  "Feeling good about our relationship, positive interactions",
  "Strong connection, deep trust, and mutual support"
];

interface MoodTrackerProps {
  onMoodSaved: () => void;
  dailyMood: MoodEntry | null;
}

const MoodTracker: React.FC<MoodTrackerProps> = ({ onMoodSaved, dailyMood }) => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [isVisibleToPartner, setIsVisibleToPartner] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { user, profile } = useAuth();
  const { saveDailyMood } = useDailyMood();
  
  console.log("MoodTracker rendered with dailyMood:", dailyMood);
  
  // Update form when dailyMood changes
  useEffect(() => {
    if (dailyMood) {
      console.log("Setting form values from dailyMood:", dailyMood);
      setSelectedMood(dailyMood.mood_value);
      setNote(dailyMood.note || "");
      setIsVisibleToPartner(dailyMood.is_visible_to_partner !== false);
    } else {
      setSelectedMood(null);
      setNote("");
      setIsVisibleToPartner(true);
    }
  }, [dailyMood]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedMood === null) {
      toast.error('Please select a mood');
      return;
    }
    
    if (!user) {
      toast.error('You must be logged in to save a mood entry');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Saving mood:", selectedMood, "note:", note, "visible:", isVisibleToPartner);
      
      // Save to daily_moods with upsert
      const result = await saveDailyMood(selectedMood, note, isVisibleToPartner);
      if (result.error) throw result.error;
      
      // Also save to check_ins for backward compatibility
      const moodString = `${selectedMood}_${moodLabels[selectedMood-1].toLowerCase()}`;
      
      await supabase
        .from('check_ins')
        .insert({
          mood: moodString,
          reflection: note || null,
          satisfaction_rating: selectedMood * 2,
          user_id: user.id,
        });
      
      console.log("Mood saved successfully");
      
      // Notify parent component
      onMoodSaved();
    } catch (error: any) {
      console.error('Error saving mood:', error);
      toast.error('Failed to save mood: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const hasPartner = !!profile?.partner_id;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>How are you feeling about your relationship today?</CardTitle>
        <CardDescription>
          {dailyMood 
            ? "You've already recorded your mood today. You can update it if you'd like."
            : hasPartner 
              ? "Share how you're feeling with your partner"
              : "Track your relationship mood over time"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3 justify-between">
              {[1, 2, 3, 4, 5].map((mood) => (
                <button
                  key={mood}
                  type="button"
                  className={`flex-1 min-w-[100px] max-w-[160px] flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                    selectedMood === mood 
                      ? 'border-primary bg-primary/10' 
                      : 'border-muted hover:border-muted-foreground/50'
                  }`}
                  onClick={() => setSelectedMood(mood)}
                >
                  <div className="flex">
                    {Array(mood).fill(0).map((_, i) => (
                      <Heart 
                        key={i} 
                        className={`h-5 w-5 ${
                          mood === 1 ? 'text-red-500' :
                          mood === 2 ? 'text-orange-400' :
                          mood === 3 ? 'text-yellow-500' :
                          mood === 4 ? 'text-green-400' :
                          'text-green-600'
                        }`}
                        fill="currentColor"
                      />
                    ))}
                    {Array(5 - mood).fill(0).map((_, i) => (
                      <Heart 
                        key={`empty-${i}`} 
                        className="h-5 w-5 text-gray-200"
                      />
                    ))}
                  </div>
                  <span className="mt-2 font-medium text-sm">{moodLabels[mood-1]}</span>
                  <p className="text-xs text-muted-foreground text-center mt-1">
                    {moodDescriptions[mood-1]}
                  </p>
                </button>
              ))}
            </div>
            
            <div className="space-y-2 mt-4">
              <label className="text-sm font-medium">Add a note (optional)</label>
              <Textarea 
                placeholder="What's on your mind about your relationship today?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
            </div>
            
            {hasPartner && (
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="visibility-mode"
                  checked={isVisibleToPartner}
                  onCheckedChange={setIsVisibleToPartner}
                />
                <Label htmlFor="visibility-mode" className="flex items-center gap-1.5 cursor-pointer">
                  {isVisibleToPartner ? (
                    <>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span>Visible to partner</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                      <span>Private (only visible to you)</span>
                    </>
                  )}
                </Label>
              </div>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full btn-primary-gradient" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {dailyMood ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              dailyMood ? 'Update Mood Entry' : 'Save Mood Entry'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MoodTracker;
