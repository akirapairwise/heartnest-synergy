
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface EventFeedbackProps {
  eventId: string;
  existingFeedback?: string | null;
  user: User | null;
  onFeedbackSaved: () => void;
}

const EventFeedback = ({ eventId, existingFeedback, user, onFeedbackSaved }: EventFeedbackProps) => {
  const [feedback, setFeedback] = useState(existingFeedback || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to leave feedback",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // First check if the event_feedback record exists
      // Use type assertion to temporarily bypass TypeScript error
      const { data: existingRecord, error: checkError } = await (supabase
        .from('event_feedback' as any)
        .select('*')
        .eq('event_id', eventId)
        .single() as any);
      
      if (checkError && checkError.code !== 'PGRST116') {
        // Error other than "no rows returned"
        throw checkError;
      }
      
      if (existingRecord) {
        // Update existing feedback
        const { error } = await (supabase
          .from('event_feedback' as any)
          .update({ 
            feedback: feedback,
            updated_at: new Date().toISOString()
          })
          .eq('event_id', eventId) as any);
          
        if (error) throw error;
      } else {
        // Insert new feedback
        const { error } = await (supabase
          .from('event_feedback' as any)
          .insert({ 
            event_id: eventId,
            user_id: user.id,
            feedback: feedback,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }) as any);
          
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Your feedback has been saved"
      });
      onFeedbackSaved();
    } catch (error) {
      console.error('Error saving feedback:', error);
      toast({
        title: "Error",
        description: "Failed to save feedback",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">Event Reflections</h3>
      <Textarea
        placeholder="Share your thoughts about this event..."
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        className="min-h-[100px]"
      />
      <Button 
        onClick={handleSubmit} 
        disabled={isSubmitting || !feedback.trim()}
        className="w-full"
      >
        {isSubmitting ? "Saving..." : existingFeedback ? "Update Reflection" : "Save Reflection"}
      </Button>
    </div>
  );
};

export default EventFeedback;
