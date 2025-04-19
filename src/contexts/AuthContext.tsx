
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { Profile } from '@/types/auth';
import { 
  fetchUserProfile, 
  signIn as apiSignIn, 
  signUp as apiSignUp, 
  signOut as apiSignOut, 
  updateOnboardingStatus, 
  updateProfile 
} from '@/services/authService';
import { toast } from 'sonner';

export type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isOnboardingComplete: boolean | null;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  updateOnboardingStatus: (isComplete: boolean) => Promise<{ error: any | null } | undefined>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: any | null } | undefined>;
  fetchUserProfile: (userId: string) => Promise<void>;
  refreshSession: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Improved refreshSession function with error handling and timeout
  const refreshSession = async () => {
    try {
      console.log('Refreshing session...');
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        setSession(null);
        setUser(null);
        setAuthChecked(true);
        return;
      }
      
      setSession(data.session);
      setUser(data.session?.user || null);
      
      if (data.session?.user) {
        const profileResult = await fetchUserProfile(data.session.user.id);
        setProfile(profileResult.profile);
        setIsOnboardingComplete(profileResult.isOnboardingComplete);
      }
      
      setAuthChecked(true);
    } catch (error) {
      console.error("Error in refreshSession:", error);
      setSession(null);
      setUser(null);
      setAuthChecked(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize authentication state
  useEffect(() => {
    // First, set up auth state listener before checking session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('Auth state changed:', event);
      
      // Use setTimeout to avoid deadlocks in Supabase auth
      setTimeout(() => {
        setSession(currentSession);
        setUser(currentSession?.user || null);
        
        // Don't make additional Supabase calls here to prevent loops
        if (currentSession?.user) {
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            // Only fetch profile if we have a session
            fetchUserProfile(currentSession.user.id).then(({ profile, isOnboardingComplete }) => {
              setProfile(profile);
              setIsOnboardingComplete(isOnboardingComplete);
            });
          }
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setIsOnboardingComplete(null);
        }
      }, 0);
    });

    // Then check initial session
    refreshSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfileContext = async (userId: string) => {
    try {
      const result = await fetchUserProfile(userId);
      setProfile(result.profile);
      setIsOnboardingComplete(result.isOnboardingComplete);
      return result;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return { profile: null, isOnboardingComplete: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await apiSignIn(email, password);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await apiSignUp(email, password);
      
      // If signup was successful but we don't have a session yet (due to email confirmation)
      if (!result.error) {
        // Try to get session after successful signup
        await refreshSession();
      }
      
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await apiSignOut();
      setSession(null);
      setUser(null);
      setProfile(null);
      setIsOnboardingComplete(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOnboardingStatusContext = async (isComplete: boolean) => {
    if (user) {
      const result = await updateOnboardingStatus(user.id, isComplete);
      if (!result?.error) {
        setIsOnboardingComplete(isComplete);
        // Optimistically update the profile in the context
        setProfile(prevProfile => {
          if (prevProfile) {
            return { ...prevProfile, is_onboarding_complete: isComplete };
          }
          return prevProfile;
        });
      }
      return result;
    }
  };

  const updateProfileContext = async (data: Partial<Profile>) => {
    if (user) {
      const result = await updateProfile(user.id, data);
      if (!result?.error) {
        setProfile(prevProfile => {
          if (prevProfile) {
            return { ...prevProfile, ...data };
          }
          return { ...data } as Profile;
        });
      }
      return result;
    }
  };

  const contextValue = {
    session,
    user,
    profile,
    isLoading,
    isOnboardingComplete,
    signIn,
    signUp,
    signOut,
    updateOnboardingStatus: updateOnboardingStatusContext,
    updateProfile: updateProfileContext,
    fetchUserProfile: fetchUserProfileContext,
    refreshSession
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
