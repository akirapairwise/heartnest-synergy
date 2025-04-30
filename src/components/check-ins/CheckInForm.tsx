
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Send, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { moodOptions } from './MoodOptions';
import { useAuth } from '@/contexts/AuthContext';

interface CheckInFormProps {
  onCheckInSaved: () => void;
  defaultMood?: string;
}

const CheckInForm: React.FC<CheckInFormProps> = ({ onCheckInSaved, defaultMood }) => {
  const [mood, setMood] = useState<string>("");
  const [satisfactionRating, setSatisfactionRating] = useState<number>(5);
  const [reflection, setReflection] = useState<string>("");
  const [isVisibleToPartner, setIsVisibleToPartner] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const { user, profile } = useAuth();
  const hasPartner = !!profile?.partner_id;

  // Set default mood from profile settings or from prop
  useEffect(() => {
    if (defaultMood && !mood) {
      setMood(defaultMood);
    } else if (profile?.mood_settings?.defaultMood && !mood) {
      setMood(profile.mood_settings.defaultMood);
    }
  }, [defaultMood, profile, mood]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mood) {
      toast.error('Please select a mood');
      return;
    }
    
    if (!user) {
      toast.error('You must be logged in to save a check-in');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Save to check_ins table
      const { error: checkInsError } = await supabase
        .from('check_ins')
        .insert({
          mood,
          reflection: reflection || null,
          satisfaction_rating: satisfactionRating,
          user_id: user.id,
        });

      if (checkInsError) {
        throw checkInsError;
      }
      
      // Also save to daily_moods for consistent tracking
      const today = new Date().toISOString().split('T')[0];
      
      // Derive mood_value (1-5) from satisfaction rating (1-10)
      const moodValue = Math.ceil(satisfactionRating / 2);
      
      const { error: dailyMoodsError } = await supabase
        .from('daily_moods')
        .upsert({
          user_id: user.id,
          mood_date: today,
          mood_value: moodValue,
          note: reflection || null,
          is_visible_to_partner: isVisibleToPartner
        }, {
          onConflict: 'user_id,mood_date'
        });
        
      if (dailyMoodsError) {
        console.error('Error saving to daily_moods:', dailyMoodsError);
        // Continue anyway since check-in was saved
      }

      toast.success('Check-in saved successfully');
      
      // Reset form
      setMood("");
      setSatisfactionRating(5);
      setReflection("");
      setIsVisibleToPartner(true);
      
      // Notify parent component to refresh the check-ins list
      onCheckInSaved();
    } catch (error: any) {
      console.error('Error saving check-in:', error);
      toast.error('Failed to save check-in: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-harmony-200 shadow-sm">
      <CardHeader className="space-y-1 pb-3 border-b">
        <CardTitle className="text-xl">New Check-In</CardTitle>
        <CardDescription>How are you feeling today?</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <form id="check-in-form" onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Select your mood</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {moodOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`flex items-center gap-2 p-2 sm:p-3 rounded-lg border transition-all ${
                      mood === option.value 
                        ? `border-primary bg-primary/10 ${option.color}` 
                        : 'border-muted hover:border-muted-foreground/50'
                    }`}
                    onClick={() => setMood(option.value)}
                  >
                    <div className={mood === option.value ? option.color : "text-muted-foreground"}>
                      {option.icon}
                    </div>
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Satisfaction (1-10)</Label>
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="text-sm text-muted-foreground min-w-[1ch]">1</span>
                <Slider
                  value={[satisfactionRating]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(value) => setSatisfactionRating(value[0])}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground min-w-[1ch]">10</span>
                <span className="ml-2 w-8 text-center font-medium">{satisfactionRating}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Add reflection (optional)</Label>
              <Textarea 
                placeholder="What's on your mind? How are you feeling?"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                rows={3}
                className="resize-none min-h-[80px]"
              />
            </div>
            
            {hasPartner && (
              <div className="flex items-center justify-between space-x-2 pt-2">
                <Label htmlFor="visibility-toggle" className="flex items-center gap-1.5 cursor-pointer">
                  {isVisibleToPartner ? (
                    <>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm sm:text-base">Visible to partner</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm sm:text-base">Private (only visible to you)</span>
                    </>
                  )}
                </Label>
                <Switch
                  id="visibility-toggle"
                  checked={isVisibleToPartner}
                  onCheckedChange={setIsVisibleToPartner}
                />
              </div>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end border-t pt-4 pb-4">
        <Button 
          type="submit" 
          form="check-in-form"
          variant="gradient"
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <span>Save Check-In</span>
              <Send className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CheckInForm;
