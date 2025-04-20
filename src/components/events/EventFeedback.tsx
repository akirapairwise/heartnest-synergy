
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
      const { error } = await supabase
        .from('partner_events')
        .update({ 
          feedback: feedback,
          has_feedback: true
        })
        .eq('id', eventId);

      if (error) throw error;

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
