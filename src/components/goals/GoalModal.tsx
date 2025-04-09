
import React, { useState } from 'react';
import { Dialog } from "@/components/ui/dialog";
import { Drawer } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Goal } from "@/types/goals";
import { createGoal, updateGoalStatus } from "@/services/goalService";
import { useToast } from "@/components/ui/use-toast";
import { GoalModalContent } from './GoalModalContent';
import { GoalFormValues } from './GoalForm';

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
        // Update existing goal
        await updateGoalStatus(goal.id, formValues.status);
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
          is_shared: formValues.is_shared,
          status: formValues.status
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

  if (isDesktop) {
    return (
      <GoalModalContent
        goal={goal}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onClose={onClose}
      />
    );
  }

  return (
    <GoalModalContent
      goal={goal}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      onClose={onClose}
    />
  );
}
