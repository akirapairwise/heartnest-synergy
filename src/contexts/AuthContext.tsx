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
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();

        setSession(session);
        setUser(session?.user || null);

        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error("Error loading session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();

    supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user || null);

      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setProfile(null);
        setIsOnboardingComplete(null);
      }
    });
  }, []);

  useEffect(() => {
    const getProfile = async () => {
      if (user) {
        const { profile: userProfile, isOnboardingComplete: onboardingStatus } = await fetchUserProfile(user.id);
        setProfile(userProfile);
        setIsOnboardingComplete(onboardingStatus);
      } else {
        setProfile(null);
        setIsOnboardingComplete(null);
      }
    };

    getProfile();
  }, [user]);

  const signIn = async (email: string, password: string) => {
    const result = await apiSignIn(email, password);
    return result;
  };

  const signUp = async (email: string, password: string) => {
    const result = await apiSignUp(email, password);
    return result;
  };

  const signOut = async () => {
    await apiSignOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setIsOnboardingComplete(null);
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

  const fetchUserProfileContext = async (userId: string) => {
    const { profile: userProfile, isOnboardingComplete: onboardingStatus } = await fetchUserProfile(userId);
    setProfile(userProfile);
    setIsOnboardingComplete(onboardingStatus);
  };

  return (
    <AuthContext.Provider value={{
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
      fetchUserProfile: fetchUserProfileContext
    }}>
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
