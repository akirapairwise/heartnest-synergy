
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { Profile } from '@/types/auth';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isOnboardingComplete: boolean | null;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any | null }>;
  updateProfile: (updates: any) => Promise<{ error: any | null } | undefined>;
  fetchUserProfile: (userId: string) => Promise<void>;
  updateOnboardingStatus: (isComplete: boolean) => Promise<{ error: any | null } | undefined>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }
      setIsLoading(false);
    };

    getSession();

    supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null);
      setSession(session);
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }
    });
  }, []);

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        toast({
          title: "Error!",
          description: "Failed to fetch user profile.",
        });
      } else {
        // Transform mood_settings to ensure it matches our expected type
        const formattedProfile: Profile = {
          ...data,
          mood_settings: data.mood_settings ? 
            {
              showAvatar: typeof data.mood_settings === 'object' && data.mood_settings !== null ? 
                data.mood_settings.showAvatar : true,
              defaultMood: typeof data.mood_settings === 'object' && data.mood_settings !== null ? 
                data.mood_settings.defaultMood : 'neutral'
            } : null
        };
        
        setProfile(formattedProfile);
        setIsOnboardingComplete(data?.is_onboarding_complete ?? false);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: "Error!",
        description: "Unexpected error fetching user profile.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('Sign-in error:', error);
        toast({
          title: "Error!",
          description: "Failed to sign in.",
        });
        return { error };
      } else {
        toast({
          title: "Welcome back!",
          description: "You've been successfully signed in.",
        });
        return { error: null };
      }
    } catch (error) {
      console.error('Unexpected sign-in error:', error);
      toast({
        title: "Error!",
        description: "Unexpected error during sign in.",
      });
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      if (error) {
        console.error('Sign-up error:', error);
        toast({
          title: "Error!",
          description: "Failed to sign up.",
        });
        return { error };
      } else {
        toast({
          title: "Check your email!",
          description: "We've sent you a confirmation link to verify your account.",
        });
        console.log('Sign-up successful:', data);
        return { error: null };
      }
    } catch (error) {
      console.error('Unexpected sign-up error:', error);
      toast({
        title: "Error!",
        description: "Unexpected error during sign up.",
      });
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign-out error:', error);
        toast({
          title: "Error!",
          description: "Failed to sign out.",
        });
      } else {
        toast({
          title: "Signed out!",
          description: "You have been successfully signed out.",
        });
      }
    } catch (error) {
      console.error('Unexpected sign-out error:', error);
      toast({
        title: "Error!",
        description: "Unexpected error during sign out.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: any) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user?.id);

      if (error) {
        console.error('Profile update error:', error);
        toast({
          title: "Error!",
          description: "Failed to update profile.",
        });
        return { error };
      } else {
        toast({
          title: "Profile updated!",
          description: "Your profile has been successfully updated.",
        });
        await fetchUserProfile(user?.id as string);
        return { error: null };
      }
    } catch (error) {
      console.error('Unexpected profile update error:', error);
      toast({
        title: "Error!",
        description: "Unexpected error during profile update.",
      });
      return { error };
    } finally {
      setIsLoading(false);
    }
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
        toast({
          title: "Error!",
          description: "Failed to update onboarding status.",
        });
        return { error };
      }
      
      setIsOnboardingComplete(isComplete);
      return { error: null };
    } catch (error) {
      console.error('Error updating onboarding status:', error);
      toast({
        title: "Error!",
        description: "Unexpected error updating onboarding status.",
      });
      return { error };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    isLoading,
    isOnboardingComplete,
    signIn,
    signOut,
    signUp,
    updateProfile,
    fetchUserProfile,
    updateOnboardingStatus,
  };

  return (
    <AuthContext.Provider value={value}>
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
