import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast"

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  updateProfile: (updates: any) => Promise<void>;
  fetchUserProfile: (userId: string) => Promise<void>;
};

type UserProfile = {
  id: string;
  full_name: string | null;
  bio: string | null;
  location: string | null;
  is_onboarding_complete: boolean;
  love_language: string | null;
  communication_style: string | null;
  relationship_goals: string | null;
  emotional_needs: string | null;
  financial_attitude: string | null;
  mood_settings: any | null;
  partner_id: string | null;
  created_at: string;
  updated_at: string;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
        })
      } else {
        setProfile(data || null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: "Error!",
        description: "Unexpected error fetching user profile.",
      })
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const signIn = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) {
        console.error('Sign-in error:', error);
        toast({
          title: "Error!",
          description: "Failed to sign in.",
        })
      } else {
        toast({
          title: "Check your email!",
          description: "We've sent you a magic link to sign in.",
        })
      }
    } catch (error) {
      console.error('Unexpected sign-in error:', error);
      toast({
        title: "Error!",
        description: "Unexpected error during sign in.",
      })
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        console.error('Sign-up error:', error);
        toast({
          title: "Error!",
          description: "Failed to sign up.",
        })
      } else {
        toast({
          title: "Check your email!",
          description: "We've sent you a confirmation link to verify your account.",
        })
        console.log('Sign-up successful:', data);
      }
    } catch (error) {
      console.error('Unexpected sign-up error:', error);
      toast({
        title: "Error!",
        description: "Unexpected error during sign up.",
      })
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
        })
      } else {
        toast({
          title: "Signed out!",
          description: "You have been successfully signed out.",
        })
      }
    } catch (error) {
      console.error('Unexpected sign-out error:', error);
      toast({
        title: "Error!",
        description: "Unexpected error during sign out.",
      })
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
        })
      } else {
        toast({
          title: "Profile updated!",
          description: "Your profile has been successfully updated.",
        })
        await fetchUserProfile(user?.id as string);
      }
    } catch (error) {
      console.error('Unexpected profile update error:', error);
      toast({
        title: "Error!",
        description: "Unexpected error during profile update.",
      })
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    isLoading,
    signIn,
    signOut,
    signUp,
    updateProfile,
    fetchUserProfile,
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
