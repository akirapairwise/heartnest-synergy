import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Profile, AuthContextType } from '@/types/auth';

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Load the initial session and user
    const loadSession = async () => {
      await refreshSession();
    };
    
    loadSession();
    
    // Subscribe to auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change event:", event);
      setSession(session);
      setUser(session?.user || null);
      refreshSession();
    });
  }, []);
  
  useEffect(() => {
    if (user) {
      fetchUserProfile(user.id);
    } else {
      setProfile(null);
      setIsOnboardingComplete(null);
    }
  }, [user]);
  
  // Function to sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      
      if (error) {
        console.error('Sign-in error:', error);
        return { error };
      }
      
      setSession(data.session);
      setUser(data.user);
      
      // Fetch the user profile immediately after signing in
      if (data.user) {
        await fetchUserProfile(data.user.id);
      }
      
      return { error: null };
    } catch (error: any) {
      console.error('Unexpected sign-in error:', error);
      return { error: { message: error.message || 'An unexpected error occurred.' } };
    }
  };
  
  // Function to sign up with email and password
  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            // You can add additional user metadata here
            full_name: '',
          },
        },
      });
      
      if (error) {
        console.error('Sign-up error:', error);
        return { error };
      }
      
      setSession(data.session);
      setUser(data.user);
      
      // Fetch the user profile immediately after signing up
      if (data.user) {
        await fetchUserProfile(data.user.id);
      }
      
      return { error: null };
    } catch (error: any) {
      console.error('Unexpected sign-up error:', error);
      return { error: { message: error.message || 'An unexpected error occurred.' } };
    }
  };
  
  // Function to sign in with Google
  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      
      if (error) {
        console.error('Google sign-in error:', error);
        return { error };
      }
      
      // The user will be redirected to Google for authentication
      return { error: null };
    } catch (error: any) {
      console.error('Unexpected Google sign-in error:', error);
      return { error: { message: error.message || 'An unexpected error occurred.' } };
    }
  };
  
  // Function to sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      setSession(null);
      setUser(null);
      setProfile(null);
      setIsOnboardingComplete(null);
      navigate('/auth', { replace: true });
    } catch (error: any) {
      console.error('Error signing out:', error);
    }
  };
  
  // Function to update onboarding status
  const updateOnboardingStatus = async (isComplete: boolean) => {
    if (!user) {
      return { error: { message: 'No user is logged in.' } };
    }
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_onboarding_complete: isComplete })
        .eq('id', user.id);
      
      if (error) {
        throw error;
      }
      
      setIsOnboardingComplete(isComplete);
      return { error: null };
    } catch (error: any) {
      console.error('Error updating onboarding status:', error);
      return { error };
    }
  };
  
  // Function to fetch user profile
  const fetchUserProfile = async (userId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        // If no profile exists, create one
        if (error.message.includes('No rows found')) {
          console.log('No profile found, creating a new one');
          await createProfile(userId);
          return;
        }
        throw error;
      }
      
      setProfile(data);
      setIsOnboardingComplete(data?.is_onboarding_complete ?? false);
      console.log("Fetched user profile:", data);
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to create user profile
  const createProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{ id: userId }])
        .select('*')
        .single();
      
      if (error) {
        throw error;
      }
      
      setProfile(data);
      setIsOnboardingComplete(false);
      console.log("Created user profile:", data);
    } catch (error: any) {
      console.error('Error creating user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      setIsLoading(true);
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }
      
      if (session) {
        setSession(session);
        setUser(session.user);
        
        // Fetch the user profile
        if (session.user) {
          await fetchUserProfile(session.user.id);
        }
      } else {
        // Clear user data if no session exists
        setUser(null);
        setProfile(null);
        setIsOnboardingComplete(null);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<Profile>) => {
    if (!user) {
      return { error: { message: 'No user is logged in.' } };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single();

    if (error) {
      throw error;
    }

    // Important: Update local profile state to reflect changes
    setProfile(data as Profile);
    
    // If onboarding status is being updated, update that state too
    if ('is_onboarding_complete' in profileData) {
      setIsOnboardingComplete(!!profileData.is_onboarding_complete);
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return { error };
  }
};
  
  // Provide the authentication context value
  const value: AuthContextType = {
    session,
    user,
    profile,
    isLoading,
    isOnboardingComplete,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    updateOnboardingStatus,
    updateProfile,
    fetchUserProfile,
    refreshSession
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the authentication context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
