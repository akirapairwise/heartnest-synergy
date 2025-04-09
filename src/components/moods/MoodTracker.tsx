
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';
import { useDailyMood, DailyMood } from '@/hooks/useDailyMood';

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
  dailyMood: DailyMood | null;
}

const MoodTracker: React.FC<MoodTrackerProps> = ({ onMoodSaved, dailyMood }) => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { saveDailyMood } = useDailyMood();
  
  console.log("MoodTracker rendered with dailyMood:", dailyMood);
  
  // Update form when dailyMood changes
  useEffect(() => {
    if (dailyMood) {
      console.log("Setting form values from dailyMood:", dailyMood);
      setSelectedMood(dailyMood.mood_value);
      setNote(dailyMood.note || "");
    } else {
      setSelectedMood(null);
      setNote("");
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
      console.log("Saving mood:", selectedMood, "note:", note);
      
      // Save to daily_moods
      const { error } = await saveDailyMood(selectedMood, note);
      if (error) throw error;
      
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
      toast.success(dailyMood ? 'Mood updated successfully!' : 'Mood tracked successfully!');
      
      // Notify parent component
      onMoodSaved();
    } catch (error: any) {
      console.error('Error saving mood:', error);
      toast.error('Failed to save mood: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>How are you feeling about your relationship today?</CardTitle>
        <CardDescription>
          {dailyMood 
            ? "You've already recorded your mood today. You can update it if you'd like."
            : "Your partner won't see your response until they submit theirs"}
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
