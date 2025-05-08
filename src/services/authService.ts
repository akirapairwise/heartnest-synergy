
import { supabase } from '@/integrations/supabase/client';
import type { Profile } from '@/types/auth';
import { toast } from 'sonner';

export const fetchUserProfile = async (userId: string) => {
  try {
    console.log('Fetching profile for user:', userId);
    
    // Use direct ID lookup without any joins or complex policies to avoid recursion
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user profile:', error);
      return { 
        profile: null, 
        isOnboardingComplete: false, 
        error 
      };
    }

    console.log('Profile data fetched:', data);

    return { 
      profile: data as Profile, 
      isOnboardingComplete: data?.is_onboarding_complete || false,
      error: null 
    };
  } catch (err) {
    console.error('Unexpected error fetching profile:', err);
    return { 
      profile: null, 
      isOnboardingComplete: false, 
      error: err 
    };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error('Login failed', {
        description: error.message
      });
    } else {
      toast.success('Logged in successfully');
    }
    return { error, session: data.session };
  } catch (error) {
    toast.error('Login failed', {
      description: 'An unexpected error occurred'
    });
    return { error };
  }
};

export const signUp = async (email: string, password: string) => {
  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      // Removed options with full_name
    });
    
    if (error) {
      toast.error('Registration failed', {
        description: error.message
      });
    } else {
      toast.success('Registration successful', {
        description: 'Please check your email to confirm your account'
      });
    }
    
    return { error };
  } catch (error) {
    toast.error('Registration failed', {
      description: 'An unexpected error occurred'
    });
    return { error };
  }
};

export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth'
      }
    });
    
    if (error) {
      toast.error('Google sign-in failed', {
        description: error.message
      });
    }
    
    return { error, data };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    toast.error('Google sign-in failed', {
      description: 'An unexpected error occurred'
    });
    return { error };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Sign out failed', {
        description: error.message
      });
    }
    return { error };
  } catch (error) {
    console.error('Error signing out:', error);
    return { error };
  }
};

export const updateOnboardingStatus = async (userId: string, isComplete: boolean) => {
  try {
    console.log('Updating onboarding status for user:', userId, 'to:', isComplete);
    
    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        is_onboarding_complete: isComplete, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating onboarding status:', error);
      toast.error('Failed to update onboarding status');
    } else {
      console.log('Onboarding status updated successfully');
    }
      
    return { error };
  } catch (error) {
    console.error('Error updating onboarding status:', error);
    return { error };
  }
};

export const updateProfile = async (userId: string, data: Partial<Profile>) => {
  try {
    console.log('Updating profile for user:', userId, 'with data:', data);
    
    // Make sure we don't try to update ID if it's in the data object
    // as user_id is a primary key and cannot be changed
    const { id, user_id, ...updateData } = data as any;
    
    // Extract isMoodVisibleToPartner from the data if it exists
    // This should not be sent directly to the database column
    const { isMoodVisibleToPartner, ...restData } = updateData;
    
    // Prepare the mood_settings object correctly
    let finalMoodSettings = updateData.mood_settings || {};
    
    // If isMoodVisibleToPartner is provided, add it to the mood_settings object
    if (isMoodVisibleToPartner !== undefined) {
      finalMoodSettings = {
        ...finalMoodSettings,
        isVisibleToPartner: isMoodVisibleToPartner
      };
    }
    
    const finalData = {
      ...restData,
      // Only include mood_settings if it has content
      ...(Object.keys(finalMoodSettings).length > 0 ? { mood_settings: finalMoodSettings } : {}),
      updated_at: new Date().toISOString()
    };
    
    console.log('Final data being sent to database:', finalData);
    
    const { error } = await supabase
      .from('user_profiles')
      .update(finalData)
      .eq('id', userId);
      
    if (error) {
      console.error('Supabase error updating profile:', error);
      toast.error('Failed to update profile');
      return { error };
    } else {
      console.log('Profile updated successfully');
      return { error: null };
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    return { error };
  }
};
