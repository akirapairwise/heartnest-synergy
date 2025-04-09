
import { supabase } from '@/integrations/supabase/client';
import type { Profile } from '@/types/auth';

export const fetchUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return { profile: null, isOnboardingComplete: false, error };
  }

  return { 
    profile: data as Profile, 
    isOnboardingComplete: data?.is_onboarding_complete || false,
    error: null
  };
};

export const signIn = async (email: string, password: string) => {
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  } catch (error) {
    return { error };
  }
};

export const signUp = async (email: string, password: string, fullName: string) => {
  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    return { error };
  } catch (error) {
    return { error };
  }
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const updateOnboardingStatus = async (userId: string, isComplete: boolean) => {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        is_onboarding_complete: isComplete, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', userId);
      
    return { error };
  } catch (error) {
    console.error('Error updating onboarding status:', error);
    return { error };
  }
};

export const updateProfile = async (userId: string, data: Partial<Profile>) => {
  try {
    console.log('Updating profile for user:', userId, 'with data:', data);
    
    const { error } = await supabase
      .from('user_profiles')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
      
    if (error) {
      console.error('Supabase error updating profile:', error);
    } else {
      console.log('Profile updated successfully');
    }
    
    return { error };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { error };
  }
};
