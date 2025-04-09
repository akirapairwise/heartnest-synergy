
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType, Profile } from '@/types/auth';
import * as authService from '@/services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // After setting auth state, check profile and onboarding status
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setIsOnboardingComplete(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchUserProfile = async (userId: string) => {
    try {
      setIsLoading(true);
      const { profile, isOnboardingComplete, error } = await authService.fetchUserProfile(userId);
      
      if (error) {
        console.error('Error fetching user profile:', error);
        setProfile(null);
        setIsOnboardingComplete(false);
      } else {
        setProfile(profile);
        setIsOnboardingComplete(isOnboardingComplete);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setProfile(null);
      setIsOnboardingComplete(false);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    return await authService.signIn(email, password);
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    return await authService.signUp(email, password, fullName);
  };

  const signOut = async () => {
    await authService.signOut();
    navigate('/auth');
  };

  const updateOnboardingStatus = async (isComplete: boolean) => {
    if (!user) return;
    
    const { error } = await authService.updateOnboardingStatus(user.id, isComplete);
    
    if (!error) {
      setIsOnboardingComplete(isComplete);
      if (profile) {
        setProfile({
          ...profile,
          is_onboarding_complete: isComplete,
          updated_at: new Date().toISOString()
        });
      }
    }
    
    return { error };
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user || !profile) {
      return { error: new Error("User not authenticated or profile not loaded") };
    }
    
    const { error } = await authService.updateProfile(user.id, data);
    
    if (!error) {
      setProfile({
        ...profile,
        ...data,
        updated_at: new Date().toISOString()
      });
      
      // Update onboarding status if it's included in the update
      if (data.is_onboarding_complete !== undefined) {
        setIsOnboardingComplete(data.is_onboarding_complete);
      }
    }
    
    return { error };
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        isLoading,
        isOnboardingComplete,
        signIn,
        signUp,
        signOut,
        updateOnboardingStatus,
        updateProfile,
        fetchUserProfile,
      }}
    >
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
