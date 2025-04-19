
import { useState } from 'react';
import { Goal } from '@/types/goals';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useMilestoneManagement = (onRefresh: () => void) => {
  const handleMilestoneToggle = async (goalId: string, milestone: string, isChecked: boolean) => {
    try {
      const { data: currentGoal, error: fetchError } = await supabase
        .from('goals')
        .select('completed_milestones, milestones')
        .eq('id', goalId)
        .single();

      if (fetchError) {
        console.error('Error fetching goal:', fetchError);
        toast({
          title: "Error",
          description: "Failed to load goal data"
        });
        return;
      }

      let completedMilestones = currentGoal?.completed_milestones || [];
      
      if (isChecked) {
        completedMilestones = [...completedMilestones, milestone];
      } else {
        completedMilestones = completedMilestones.filter(m => m !== milestone);
      }

      const totalMilestones = currentGoal?.milestones?.length || 0;
      const completionPercentage = totalMilestones > 0 
        ? Math.round((completedMilestones.length / totalMilestones) * 100)
        : 0;

      const status = completionPercentage === 100 ? 'completed' : 
                     completionPercentage > 0 ? 'in_progress' : 'pending';

      const { error: updateError } = await supabase
        .from('goals')
        .update({ 
          completed_milestones: completedMilestones,
          status
        })
        .eq('id', goalId);

      if (updateError) {
        console.error('Error updating goal:', updateError);
        toast({
          title: "Error",
          description: "Failed to update milestone"
        });
        return;
      }

      toast({
        title: "Milestone updated",
        description: isChecked ? "Milestone completed!" : "Milestone unchecked"
      });

      onRefresh();
    } catch (error) {
      console.error('Error updating milestone:', error);
      toast({
        title: "Error",
        description: "Failed to update milestone"
      });
    }
  };

  const calculateProgress = (goal: Goal) => {
    if (!goal.milestones?.length) return 0;
    const completed = goal.completed_milestones?.length || 0;
    return Math.round((completed / goal.milestones.length) * 100);
  };

  return {
    handleMilestoneToggle,
    calculateProgress
  };
};
