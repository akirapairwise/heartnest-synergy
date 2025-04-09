
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { moodOptions } from './MoodOptions';
import { useAuth } from '@/contexts/AuthContext';

interface CheckInFormProps {
  onCheckInSaved: () => void;
}

const CheckInForm: React.FC<CheckInFormProps> = ({ onCheckInSaved }) => {
  const [mood, setMood] = useState<string>("");
  const [satisfactionRating, setSatisfactionRating] = useState<number>(5);
  const [reflection, setReflection] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const { user } = useAuth();

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
      // Use type assertions to work around TypeScript limitations
      const { error } = await supabase
        .from('check_ins')
        .insert([
          {
            mood,
            reflection: reflection || null,
            satisfaction_rating: satisfactionRating,
            user_id: user.id,
          },
        ]) as { error: any };

      if (error) {
        throw error;
      }

      toast.success('Check-in saved successfully');
      
      // Reset form
      setMood("");
      setSatisfactionRating(5);
      setReflection("");
      
      // Notify parent component to refresh the check-ins list
      onCheckInSaved();
    } catch (error) {
      console.error('Error saving check-in:', error);
      toast.error('Failed to save check-in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Check-In</CardTitle>
        <CardDescription>How are you feeling today?</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Select your mood</Label>
              <div className="grid grid-cols-3 gap-2">
                {moodOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`flex flex-col items-center p-4 rounded-lg border transition-all ${
                      mood === option.value 
                        ? `border-primary bg-primary/10 ${option.color}` 
                        : 'border-muted hover:border-muted-foreground/50'
                    }`}
                    onClick={() => setMood(option.value)}
                  >
                    <div className={mood === option.value ? option.color : "text-muted-foreground"}>
                      {option.icon}
                    </div>
                    <span className="mt-2 text-sm font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Satisfaction (1-10)</Label>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">1</span>
                <Slider
                  value={[satisfactionRating]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(value) => setSatisfactionRating(value[0])}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">10</span>
                <span className="ml-2 w-8 text-center font-medium">{satisfactionRating}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Add reflection (optional)</Label>
              <Textarea 
                placeholder="What's on your mind? How are you feeling?"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full btn-primary-gradient" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Check-In'}
            <Send className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CheckInForm;
