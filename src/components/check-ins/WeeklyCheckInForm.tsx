import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Smile, Meh, Frown, Heart } from 'lucide-react';
import { moodOptions } from '@/components/check-ins/MoodOptions';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useWeeklyAISummary } from '@/hooks/useWeeklyAISummary';

// Define the schema for the form
const formSchema = z.object({
  mood: z.string({
    required_error: "Please select your mood",
  }),
  connection_level: z.number().min(1).max(5),
  communication_rating: z.number().min(1).max(5),
  reflection_note: z.string().optional(),
  is_visible_to_partner: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface WeeklyCheckInFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckInComplete?: () => void;
}

const WeeklyCheckInForm = ({ open, onOpenChange, onCheckInComplete }: WeeklyCheckInFormProps) => {
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(false);
  const { fetchSummary } = useWeeklyAISummary();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mood: 'neutral',
      connection_level: 3,
      communication_rating: 3,
      reflection_note: '',
      is_visible_to_partner: false,
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast.error("You must be logged in to submit a check-in");
      return;
    }
    
    setLoading(true);
    
    try {
      // Insert the check-in data into the database
      const { data, error } = await supabase
        .from('weekly_check_ins')
        .insert({
          user_id: user.id,
          mood: values.mood,
          connection_level: values.connection_level,
          communication_rating: values.communication_rating,
          reflection_note: values.reflection_note || null,
          is_visible_to_partner: values.is_visible_to_partner,
          checkin_date: new Date().toISOString(),
        });
      
      if (error) {
        throw error;
      }
      
      toast.success("Check-in complete!", {
        description: "Your weekly check-in has been recorded successfully.",
      });
      
      // Trigger the AI summary generation
      fetchSummary();
      
      // Close the modal and reset the form
      onOpenChange(false);
      form.reset();
      
      // Call the callback if provided
      if (onCheckInComplete) {
        onCheckInComplete();
      }
    } catch (error: any) {
      console.error('Error submitting weekly check-in:', error);
      toast.error("Failed to submit check-in", {
        description: error.message || "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Weekly Check-In</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            {/* Mood Selection */}
            <FormField
              control={form.control}
              name="mood"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How are you feeling this week?</FormLabel>
                  <div className="flex justify-between mt-2">
                    {moodOptions.map(option => (
                      <div 
                        key={option.value}
                        onClick={() => field.onChange(option.value)}
                        className={`flex flex-col items-center p-2 rounded-lg cursor-pointer transition-all
                          ${field.value === option.value 
                            ? `ring-2 ring-offset-2 ${option.color.replace('text-', 'ring-')}` 
                            : 'hover:bg-muted'
                          }`}
                      >
                        <div className={option.color}>
                          {option.icon}
                        </div>
                        <span className="text-xs mt-1">{option.label}</span>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Connection Level */}
            <FormField
              control={form.control}
              name="connection_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Connection Level</FormLabel>
                  <div className="flex flex-col space-y-3">
                    <div className="flex justify-between text-xs text-muted-foreground px-1">
                      <span>Distant</span>
                      <span>Connected</span>
                    </div>
                    <FormControl>
                      <Slider
                        min={1}
                        max={5}
                        step={1}
                        defaultValue={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                        className="w-full"
                      />
                    </FormControl>
                    <div className="flex justify-between text-sm">
                      {[1, 2, 3, 4, 5].map(num => (
                        <span key={num} className={`px-1 ${field.value === num ? 'font-bold text-primary' : ''}`}>{num}</span>
                      ))}
                    </div>
                  </div>
                  <FormDescription>
                    Rate how connected you felt with your partner this week.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Communication Rating */}
            <FormField
              control={form.control}
              name="communication_rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Communication Quality</FormLabel>
                  <div className="flex flex-col space-y-3">
                    <div className="flex justify-between text-xs text-muted-foreground px-1">
                      <span>Poor</span>
                      <span>Excellent</span>
                    </div>
                    <FormControl>
                      <Slider
                        min={1}
                        max={5}
                        step={1}
                        defaultValue={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                        className="w-full"
                      />
                    </FormControl>
                    <div className="flex justify-between text-sm">
                      {[1, 2, 3, 4, 5].map(num => (
                        <span key={num} className={`px-1 ${field.value === num ? 'font-bold text-primary' : ''}`}>{num}</span>
                      ))}
                    </div>
                  </div>
                  <FormDescription>
                    Rate how well you communicated with your partner this week.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Reflection Note */}
            <FormField
              control={form.control}
              name="reflection_note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reflections (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your thoughts about this week..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Anything you'd like to note about your relationship this week.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Visibility Toggle */}
            <FormField
              control={form.control}
              name="is_visible_to_partner"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Share with Partner</FormLabel>
                    <FormDescription>
                      Allow your partner to see this check-in
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-gradient-to-r from-love-500 to-harmony-500 text-white"
              >
                {loading ? "Submitting..." : "Submit Check-In"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default WeeklyCheckInForm;
