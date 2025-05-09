
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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth?redirected=confirmation`,
      }
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
    
    return { error, data };
  } catch (error) {
    toast.error('Registration failed', {
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

export const resetPassword = async (email: string) => {
  try {
    // Set a longer timeout for this operation
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), 15000)
    );

    const resetPromise = supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?redirected=reset-password`,
    });

    // Race between the API call and the timeout
    const { error } = await Promise.race([
      resetPromise,
      timeoutPromise.then(() => ({ error: { message: 'Request timed out, please try again' } }))
    ]) as { error: any };

    if (error) {
      console.error('Password reset error:', error);
      toast.error('Password reset failed', {
        description: error.message
      });
      return { error };
    }
    
    toast.success('Password reset email sent', {
      description: 'Please check your email for the reset link'
    });
    return { error: null };
  } catch (error: any) {
    console.error('Password reset exception:', error);
    toast.error('Password reset failed', {
      description: error.message || 'An unexpected error occurred'
    });
    return { error };
  }
};

export const updatePassword = async (newPassword: string) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      toast.error('Password update failed', {
        description: error.message
      });
      return { error };
    }
    
    toast.success('Password updated successfully');
    return { error: null };
  } catch (error) {
    toast.error('Password update failed', {
      description: 'An unexpected error occurred'
    });
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

// Implementation function with user ID provided
const updateProfileWithUserId = async (userId: string, data: Partial<Profile>) => {
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
    
    // Format the date fields properly before saving
    const formattedData = {
      ...restData,
      // Format dates if they exist (ISO format for database storage)
      ...(restData.anniversary_date ? { anniversary_date: new Date(restData.anniversary_date).toISOString().split('T')[0] } : {}),
      ...(restData.birthday_date ? { birthday_date: new Date(restData.birthday_date).toISOString().split('T')[0] } : {}),
      ...(restData.partner_birthday_date ? { partner_birthday_date: new Date(restData.partner_birthday_date).toISOString().split('T')[0] } : {}),
      // Only include mood_settings if it has content
      ...(Object.keys(finalMoodSettings).length > 0 ? { mood_settings: finalMoodSettings } : {}),
      updated_at: new Date().toISOString()
    };
    
    console.log('Final data being sent to database:', formattedData);
    
    const { error } = await supabase
      .from('user_profiles')
      .update(formattedData)
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

// Public API function with the existing signature
export const updateProfile = async (data: Partial<Profile>) => {
  try {
    // Get the current user ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      const authError = new Error('No authenticated user found');
      console.error('Error updating profile:', authError);
      return { error: authError };
    }
    
    // Call the implementation function with the user ID
    return updateProfileWithUserId(user.id, data);
  } catch (error) {
    console.error('Error in updateProfile wrapper:', error);
    return { error };
  }
};
