
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Conflict } from '@/types/conflicts';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { generateAIResolution } from '@/services/conflictService';

const formSchema = z.object({
  response: z.string().min(10, "Please provide a detailed response of at least 10 characters"),
});

type ConflictResponseFormProps = {
  conflict: Conflict;
  onSuccess: () => void;
};

const ConflictResponseForm = ({ conflict, onSuccess }: ConflictResponseFormProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      response: ""
    }
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!user) {
      toast.error("You must be logged in to respond to a conflict");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Update the conflict with the responder's statement
      const { error } = await supabase
        .from('conflicts')
        .update({
          responder_statement: data.response
        })
        .eq('id', conflict.id);

      if (error) throw error;
      
      // Generate AI resolution once the response is submitted
      toast.promise(
        generateAIResolution(conflict.id),
        {
          loading: 'Generating AI resolution...',
          success: 'AI resolution generated successfully',
          error: 'Failed to generate AI resolution'
        }
      );
      
      form.reset();
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit response");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="bg-muted/50 p-4 rounded-md mb-4">
          <h3 className="font-medium mb-2">Partner's Statement:</h3>
          <p className="text-sm">{conflict.initiator_statement}</p>
        </div>
        
        <FormField
          control={form.control}
          name="response"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Response</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Share your perspective on this conflict..." 
                  className="min-h-[120px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Submitting...' : 'Submit Response'}
        </Button>
      </form>
    </Form>
  );
};

export default ConflictResponseForm;
