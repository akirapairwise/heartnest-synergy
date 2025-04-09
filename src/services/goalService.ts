
import { supabase } from '@/integrations/supabase/client';
import { Goal } from '@/types/goals';

export const fetchMyGoals = async (): Promise<Goal[]> => {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('owner_id', (await supabase.auth.getUser()).data.user?.id || '')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching goals:', error);
    return [];
  }

  // Add UI convenience properties
  return data.map(goal => ({
    ...goal,
    progress: getGoalProgress(goal.status),
    completed: goal.status === 'completed'
  })) as Goal[];
};

export const fetchPartnerGoals = async (): Promise<Goal[]> => {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('partner_id', (await supabase.auth.getUser()).data.user?.id || '')
    .eq('is_shared', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching partner goals:', error);
    return [];
  }

  // Add UI convenience properties
  return data.map(goal => ({
    ...goal,
    progress: getGoalProgress(goal.status),
    completed: goal.status === 'completed'
  })) as Goal[];
};

export const createGoal = async (goal: Partial<Goal>): Promise<{ goal: Goal | null; error: any }> => {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  
  if (!userId) {
    return { goal: null, error: 'User not authenticated' };
  }

  const newGoal = {
    ...goal,
    owner_id: userId,
    status: goal.status || 'pending'
  };

  const { data, error } = await supabase
    .from('goals')
    .insert(newGoal)
    .select()
    .single();

  if (error) {
    console.error('Error creating goal:', error);
    return { goal: null, error };
  }

  return { 
    goal: {
      ...data,
      progress: getGoalProgress(data.status),
      completed: data.status === 'completed'
    } as Goal, 
    error: null 
  };
};

export const updateGoalStatus = async (goalId: string, status: string): Promise<{ success: boolean; error: any }> => {
  const { error } = await supabase
    .from('goals')
    .update({ status })
    .eq('id', goalId);

  if (error) {
    console.error('Error updating goal status:', error);
    return { success: false, error };
  }

  return { success: true, error: null };
};

export const updateGoalProgress = async (goalId: string, progressPercent: number): Promise<{ success: boolean; error: any }> => {
  // Map progress percentage to a status
  let status = 'pending';
  if (progressPercent === 100) {
    status = 'completed';
  } else if (progressPercent > 0) {
    status = 'in_progress';
  }

  return updateGoalStatus(goalId, status);
};

// Helper function to convert status to a progress percentage for UI
function getGoalProgress(status: string): number {
  switch (status) {
    case 'completed':
      return 100;
    case 'in_progress':
      return 50; // Default mid-progress value
    case 'cancelled':
      return 0;
    case 'pending':
    default:
      return 0;
  }
}
