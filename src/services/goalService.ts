
import { supabase } from "@/integrations/supabase/client";
import { Goal, GoalCategory, GoalStatus } from "@/types/goals";

// Add these lines near the top, after other imports
import { notifyPartnerGoalUpdate } from './partnerNotificationService';

export const fetchGoals = async (): Promise<Goal[]> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .or(`owner_id.eq.${userData.user.id},partner_id.eq.${userData.user.id}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(goal => ({
      ...goal,
      is_self_owned: goal.owner_id === userData.user.id
    }));
  } catch (error) {
    console.error('Error fetching goals:', error);
    throw error;
  }
};

export const fetchMyGoals = async (): Promise<Goal[]> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('owner_id', userData.user.id)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data.map(goal => ({
      ...goal,
      is_self_owned: true
    }));
  } catch (error) {
    console.error('Error fetching goals:', error);
    throw error;
  }
};

// Add function to fetch partner goals
export const fetchPartnerGoals = async (): Promise<Goal[]> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) throw new Error('Not authenticated');
    
    // First, get the user's profile to find the partner ID
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('partner_id')
      .eq('id', userData.user.id)
      .single();
      
    if (profileError) throw profileError;
    
    if (!profileData?.partner_id) {
      // No partner, return empty array
      return [];
    }
    
    // Fetch goals owned by the partner
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('owner_id', profileData.partner_id)
      .eq('is_shared', true) // Only get goals marked as shared
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data.map(goal => ({
      ...goal,
      is_self_owned: false
    }));
  } catch (error) {
    console.error('Error fetching partner goals:', error);
    throw error;
  }
};

// Add function to fetch shared goals
export const fetchSharedGoals = async (): Promise<Goal[]> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) throw new Error('Not authenticated');
    
    // First, get the user's profile to find the partner ID
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('partner_id')
      .eq('id', userData.user.id)
      .single();
      
    if (profileError) throw profileError;
    
    if (!profileData?.partner_id) {
      // No partner, return empty array or just user's shared goals
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('owner_id', userData.user.id)
        .eq('is_shared', true)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return data.map(goal => ({
        ...goal,
        is_self_owned: true
      }));
    }
    
    // Fetch all shared goals either by the user or their partner
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('is_shared', true)
      .or(`owner_id.eq.${userData.user.id},owner_id.eq.${profileData.partner_id}`)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data.map(goal => ({
      ...goal,
      is_self_owned: goal.owner_id === userData.user.id
    }));
  } catch (error) {
    console.error('Error fetching shared goals:', error);
    throw error;
  }
};

export const fetchGoalById = async (id: string): Promise<Goal | null> => {
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return data || null;
  } catch (error) {
    console.error('Error fetching goal by ID:', error);
    throw error;
  }
};

// Modify the createGoal function to send notification for shared goals
export const createGoal = async (goalData: Omit<Goal, 'id' | 'created_at' | 'updated_at' | 'owner_id' | 'status'>): Promise<{ goal?: Goal; error?: any }> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('goals')
      .insert({
        ...goalData,
        owner_id: userData.user.id,
        status: 'pending'
      })
      .select('*')
      .single();

    if (error) throw error;

    // If the goal is shared and there's a partner_id, send notification
    if (data.is_shared && data.partner_id) {
      await notifyPartnerGoalUpdate(
        data.partner_id,
        data.id,
        data.title,
        'created'
      );
    }

    return { goal: data };
  } catch (error) {
    console.error('Error creating goal:', error);
    return { error };
  }
};

// Modify the updateGoal function to send notification for shared goals
export const updateGoal = async (goalId: string, updates: Partial<Goal>): Promise<{ success: boolean; error?: any }> => {
  try {
    const { data: goalData } = await supabase
      .from('goals')
      .select('*, owner_id, partner_id, is_shared, title')
      .eq('id', goalId)
      .single();
      
    if (!goalData) {
      throw new Error('Goal not found');
    }
    
    const { error } = await supabase
      .from('goals')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', goalId);

    if (error) throw error;

    // Notify partner of updates if the goal is shared
    if (goalData.is_shared && goalData.partner_id) {
      await notifyPartnerGoalUpdate(
        goalData.partner_id,
        goalId,
        goalData.title,
        'updated'
      );
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating goal:', error);
    return { success: false, error };
  }
};

// Add function to update goal status
export const updateGoalStatus = async (goalId: string, status: GoalStatus | string): Promise<{ success: boolean; error?: any }> => {
  try {
    const { data: goalData } = await supabase
      .from('goals')
      .select('*, owner_id, partner_id, is_shared, title')
      .eq('id', goalId)
      .single();
      
    if (!goalData) {
      throw new Error('Goal not found');
    }
    
    const { error } = await supabase
      .from('goals')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', goalId);

    if (error) throw error;

    // Notify partner of status change if the goal is shared
    if (goalData.is_shared && goalData.partner_id) {
      await notifyPartnerGoalUpdate(
        goalData.partner_id,
        goalId,
        goalData.title,
        status === 'completed' ? 'completed' : 'updated'
      );
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating goal status:', error);
    return { success: false, error };
  }
};

// Modify the updateGoalProgress function to send notification for shared goals
export const updateGoalProgress = async (goalId: string, progress: number): Promise<{ success: boolean; error?: any }> => {
  try {
    const { data: goalData } = await supabase
      .from('goals')
      .select('*, owner_id, partner_id, is_shared, title')
      .eq('id', goalId)
      .single();
      
    if (!goalData) {
      throw new Error('Goal not found');
    }
    
    // Update the status based on progress
    let status = goalData.status;
    if (progress === 100) {
      status = 'completed';
    } else if (progress > 0) {
      status = 'in_progress';
    } else {
      status = 'pending';
    }
    
    const { error } = await supabase
      .from('goals')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', goalId);

    if (error) throw error;

    // Notify partner of updates if the goal is shared
    if (goalData.is_shared && goalData.partner_id) {
      await notifyPartnerGoalUpdate(
        goalData.partner_id,
        goalId,
        goalData.title,
        progress === 100 ? 'completed' : 'progress'
      );
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating goal progress:', error);
    return { success: false, error };
  }
};

export const deleteGoal = async (id: string): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error deleting goal:', error);
    return { success: false, error };
  }
};

export const goalCategories: { label: string; value: GoalCategory }[] = [
  { label: 'Communication', value: 'communication' },
  { label: 'Quality Time', value: 'quality-time' },
  { label: 'Adventure', value: 'adventure' },
  { label: 'Understanding', value: 'understanding' },
  { label: 'Growth', value: 'growth' },
  { label: 'Intimacy', value: 'intimacy' },
];

export const goalStatuses: { label: string; value: GoalStatus }[] = [
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];
