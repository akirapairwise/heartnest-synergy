
import React, { useState } from 'react';
import { Dialog } from "@/components/ui/dialog";
import { Drawer } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Goal } from "@/types/goals";
import { useToast } from "@/components/ui/use-toast";
import { GoalModalContent } from './GoalModalContent';
import { GoalFormValues } from './GoalFormSchema';
import { supabase } from '@/integrations/supabase/client';

interface GoalModalProps {
  goal?: Goal;
  onClose: () => void;
  onSuccess: () => void;
}

export function GoalModal({ goal, onClose, onSuccess }: GoalModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleSubmit = async (formValues: GoalFormValues) => {
    if (!formValues.title.trim()) {
      toast({
        title: "Title is required",
        description: "Please enter a title for your goal",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      const goalData = {
        title: formValues.title,
        description: formValues.description || null,
        category: formValues.category || null,
        status: formValues.status,
        is_shared: formValues.isShared,
        goal_type: formValues.isShared ? 'shared' : 'personal',
        milestones: formValues.milestones.length > 0 ? formValues.milestones : null,
        deadline: formValues.deadline ? formValues.deadline.toISOString() : null,
        owner_id: user.id // Add the required owner_id property
      };

      if (goal) {
        // Update existing goal
        const { error } = await supabase
          .from('goals')
          .update(goalData)
          .eq('id', goal.id);
          
        if (error) throw error;
        
        toast({
          title: "Goal updated",
          description: `Your ${formValues.isShared ? 'shared' : 'personal'} goal has been updated`
        });
      } else {
        // Create new goal
        const { error } = await supabase
          .from('goals')
          .insert(goalData);
        
        if (error) throw error;
        
        toast({
          title: "Goal created",
          description: `Your new ${formValues.isShared ? 'shared' : 'personal'} goal has been created`
        });
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving goal:", error);
      toast({
        title: "Error",
        description: "There was an error saving your goal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isDesktop) {
    return (
      <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
        <GoalModalContent
          goal={goal}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onClose={onClose}
          isDesktop={isDesktop}
        />
      </Dialog>
    );
  }

  return (
    <Drawer open={true} onOpenChange={(open) => !open && onClose()}>
      <GoalModalContent
        goal={goal}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onClose={onClose}
        isDesktop={isDesktop}
      />
    </Drawer>
  );
}
