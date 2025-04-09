
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Profile = {
  id: string;
  user_id: string;
  partner_id: string | null;
  is_onboarding_complete: boolean;
  love_language: string | null;
  communication_style: string | null;
  emotional_needs: string | null;
  relationship_goals: string | null;
  financial_attitude: string | null;
  created_at: string;
  updated_at: string;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isOnboardingComplete: boolean | null;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  updateOnboardingStatus: (isComplete: boolean) => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
};

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
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        setProfile(null);
        setIsOnboardingComplete(false);
      } else {
        setProfile(data as Profile);
        setIsOnboardingComplete(data?.is_onboarding_complete || false);
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
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
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

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const updateOnboardingStatus = async (isComplete: boolean) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          is_onboarding_complete: isComplete, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', user.id);
        
      if (error) {
        console.error('Error updating onboarding status:', error);
      } else {
        setIsOnboardingComplete(isComplete);
        if (profile) {
          setProfile({
            ...profile,
            is_onboarding_complete: isComplete,
            updated_at: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Error updating onboarding status:', error);
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user || !profile) return;
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (error) {
        console.error('Error updating profile:', error);
      } else {
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
    } catch (error) {
      console.error('Error updating profile:', error);
    }
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
