
import { useState } from 'react';
import { Goal } from '@/types/goals';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { updateGoalStatus } from '@/services/goalService';

export const useGoalManagement = (onRefresh: () => void) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleStatusToggle = async (goal: Goal) => {
    try {
      const newStatus = goal.status === 'completed' ? 'in_progress' : 'completed';
      const result = await updateGoalStatus(goal.id, newStatus);
      if (result.error) throw result.error;
      
      toast(`Goal ${newStatus === 'completed' ? 'completed' : 'reopened'}`);
      onRefresh();
    } catch (error) {
      console.error('Error updating goal status:', error);
      toast.error('There was an error updating the goal status.');
    }
  };

  const confirmDelete = (goalId: string) => {
    setGoalToDelete(goalId);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (goalToDelete) {
      try {
        const { error } = await supabase
          .from('goals')
          .delete()
          .eq('id', goalToDelete);
          
        if (error) throw error;
        
        toast.success('The goal has been deleted successfully.');
        onRefresh();
      } catch (error) {
        console.error('Error deleting goal:', error);
        toast.error('There was an error deleting the goal.');
      }
      setDeleteConfirmOpen(false);
      setGoalToDelete(null);
    }
  };

  const openDetails = (goal: Goal) => {
    setSelectedGoal(goal);
    setDetailsOpen(true);
  };

  return {
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    goalToDelete,
    selectedGoal,
    detailsOpen,
    setDetailsOpen,
    handleStatusToggle,
    confirmDelete,
    handleDelete,
    openDetails
  };
};
