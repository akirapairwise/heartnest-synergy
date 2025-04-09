
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ConflictFormData } from '@/types/conflicts';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters"),
  description: z.string().min(10, "Please provide a detailed description of at least 10 characters"),
  partner_id: z.string().uuid("Invalid partner ID")
});

type ConflictFormProps = {
  onSuccess: () => void;
  partnerId: string;
};

const ConflictForm = ({ onSuccess, partnerId }: ConflictFormProps) => {
  const { user } = useAuth();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      description: "",
      partner_id: partnerId
    }
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!user) {
      toast.error("You must be logged in to record a conflict");
      return;
    }

    try {
      const { initiator_statement, responder_id } = {
        initiator_statement: `${data.topic}: ${data.description}`,
        responder_id: data.partner_id
      };

      const { error } = await supabase
        .from('conflicts')
        .insert({
          initiator_id: user.id,
          responder_id,
          initiator_statement
        });

      if (error) throw error;
      
      toast.success("Conflict recorded successfully");
      form.reset();
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to record conflict");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="topic"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conflict Topic</FormLabel>
              <FormControl>
                <Input placeholder="E.g., Communication styles, Household chores" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Perspective</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the conflict from your perspective..." 
                  className="min-h-[120px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full">
          Record Conflict
        </Button>
      </form>
    </Form>
  );
};

export default ConflictForm;
