
import { supabase } from '@/integrations/supabase/client';
import { Goal } from '@/types/goals';

export const fetchMyGoals = async (): Promise<Goal[]> => {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) return [];

  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('owner_id', userId)
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
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) return [];

  // Get user's profile to find partner_id
  const { data: profileData, error: profileError } = await supabase
    .from('user_profiles')
    .select('partner_id')
    .eq('id', userId)
    .single();

  if (profileError || !profileData?.partner_id) {
    console.error('Error fetching user profile or no partner found:', profileError);
    return [];
  }

  const partnerId = profileData.partner_id;

  // Get goals where:
  // Partner is the owner AND goal is shared with current user
  const { data: partnerGoals, error: goalsError } = await supabase
    .from('goals')
    .select('*')
    .eq('owner_id', partnerId)
    .eq('is_shared', true)
    .eq('partner_id', userId)
    .order('created_at', { ascending: false });

  if (goalsError) {
    console.error('Error fetching partner goals:', goalsError);
    return [];
  }

  // Add UI convenience properties
  return partnerGoals.map(goal => ({
    ...goal,
    progress: getGoalProgress(goal.status),
    completed: goal.status === 'completed'
  })) as Goal[];
};

export const fetchSharedGoals = async (): Promise<Goal[]> => {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) return [];

  // Get user's profile to find partner_id
  const { data: profileData, error: profileError } = await supabase
    .from('user_profiles')
    .select('partner_id')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.error('Error fetching user profile:', profileError);
    return [];
  }

  const partnerId = profileData?.partner_id;
  if (!partnerId) {
    // No partner, so no shared goals
    return [];
  }

  // Get all shared goals:
  // 1. My goals that are shared with partner
  // 2. Partner's goals that are shared with me
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('goal_type', 'shared')
    .or(`owner_id.eq.${userId},owner_id.eq.${partnerId}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching shared goals:', error);
    return [];
  }

  // Get owner names in a separate query
  const ownerIds = [...new Set(data.map(goal => goal.owner_id))];
  const { data: ownerProfiles, error: ownersError } = await supabase
    .from('user_profiles')
    .select('id, full_name')
    .in('id', ownerIds);

  if (ownersError) {
    console.error('Error fetching owner profiles:', ownersError);
  }

  // Create a map of owner IDs to names for quick lookup
  const ownerNameMap = new Map();
  if (ownerProfiles) {
    ownerProfiles.forEach(profile => {
      ownerNameMap.set(profile.id, profile.full_name || 'Unknown');
    });
  }

  // Format the response and create proper Goal objects
  return data.map(goalData => {
    return {
      ...goalData,
      owner_name: ownerNameMap.get(goalData.owner_id) || 'Unknown',
      is_self_owned: goalData.owner_id === userId,
      progress: getGoalProgress(goalData.status),
      completed: goalData.status === 'completed'
    };
  }) as Goal[];
};

export const createGoal = async (goal: Partial<Goal>): Promise<{ goal: Goal | null; error: any }> => {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  
  if (!userId) {
    return { goal: null, error: 'User not authenticated' };
  }

  // Ensure title is provided as it's required in the database
  if (!goal.title) {
    return { goal: null, error: 'Title is required' };
  }

  // Create a properly typed object for insertion
  const newGoal = {
    title: goal.title, // This is required by the database schema
    description: goal.description || null,
    category: goal.category || null,
    status: goal.status || 'pending',
    is_shared: goal.is_shared || false,
    goal_type: goal.is_shared ? 'shared' : 'personal', // Set goal_type based on is_shared
    owner_id: userId,
    partner_id: goal.is_shared ? goal.partner_id || null : null, // Only set partner_id if is_shared is true
    milestones: goal.milestones || null,
    deadline: goal.deadline || null
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
