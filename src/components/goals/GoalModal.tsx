
import React, { useState } from 'react';
import { Dialog } from "@/components/ui/dialog";
import { Drawer } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Goal } from "@/types/goals";
import { createGoal } from "@/services/goalService";
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
      
      if (goal) {
        // Update existing goal with all form values
        const { error } = await supabase
          .from('goals')
          .update({
            title: formValues.title,
            description: formValues.description || null,
            category: formValues.category || null,
            status: formValues.status,
            is_shared: formValues.isShared,
            goal_type: formValues.isShared ? 'shared' : 'personal', // Set goal_type based on isShared
            milestones: formValues.milestones.length > 0 ? formValues.milestones : null,
            deadline: formValues.deadline ? formValues.deadline.toISOString() : null
          })
          .eq('id', goal.id);
          
        if (error) throw error;
        
        toast({
          title: "Goal updated",
          description: "Your goal has been updated successfully"
        });
      } else {
        // Create new goal
        const { goal: newGoal, error } = await createGoal({
          title: formValues.title,
          description: formValues.description,
          category: formValues.category || null,
          is_shared: formValues.isShared,
          status: formValues.status,
          goal_type: formValues.isShared ? 'shared' : 'personal', // Set goal_type based on isShared
          milestones: formValues.milestones.length > 0 ? formValues.milestones : null,
          deadline: formValues.deadline ? formValues.deadline.toISOString() : null
        });
        
        if (error) {
          throw new Error(error);
        }
        
        toast({
          title: "Goal created",
          description: "Your new goal has been created successfully"
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

  return (
    <GoalModalContent
      goal={goal}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      onClose={onClose}
    />
  );
}
