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
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);
  const [lastActivityTimestamp, setLastActivityTimestamp] = useState<number>(Date.now());
  const { toast } = useToast();

  // Function to refresh the session
  const refreshSession = useCallback(async () => {
    try {
      console.log('Refreshing session...');
      setIsLoading(true);
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        // If refresh fails, try getting the current session
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          setSession(sessionData.session);
          setUser(sessionData.session.user);
          
          if (sessionData.session.user) {
            await fetchUserProfile(sessionData.session.user.id);
          }
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
          setIsOnboardingComplete(null);
        }
      } else {
        console.log('Session refreshed successfully');
        setSession(data.session);
        setUser(data.session?.user ?? null);
        
        if (data.session?.user) {
          await fetchUserProfile(data.session.user.id);
        }
      }
    } catch (error) {
      console.error('Unexpected error refreshing session:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Track user activity
  useEffect(() => {
    const handleActivity = () => {
      setLastActivityTimestamp(Date.now());
    };

    // Add event listeners for user activity
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('focus', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('focus', handleActivity);
    };
  }, []);

  // Check for session refresh need periodically
  useEffect(() => {
    const checkSessionInterval = setInterval(() => {
      const now = Date.now();
      const inactiveTime = now - lastActivityTimestamp;
      
      // If user has been inactive for more than 10 minutes and there's a session
      if (inactiveTime > 10 * 60 * 1000 && session) {
        console.log('User inactive for 10+ minutes, refreshing session');
        refreshSession();
        setLastActivityTimestamp(now);
      }
    }, 60 * 1000); // Check every minute

    return () => clearInterval(checkSessionInterval);
  }, [lastActivityTimestamp, refreshSession, session]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        console.log('Initializing auth...');
        
        // First set up the auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event: AuthChangeEvent, currentSession: Session | null) => {
            console.log('Auth state changed:', event);
            
            // Don't make Supabase calls directly in the callback to prevent deadlocks
            // Use setTimeout to defer them to the next event loop
            setTimeout(async () => {
              setSession(currentSession);
              setUser(currentSession?.user ?? null);
              
              if (currentSession?.user) {
                await fetchUserProfile(currentSession.user.id);
              } else {
                // Clear profile when logged out
                setProfile(null);
                setIsOnboardingComplete(null);
              }
            }, 0);
          }
        );

        // Then get the initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          await fetchUserProfile(initialSession.user.id);
        }

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      console.log('Fetching user profile for:', userId);
      
      // Use the security definer RPC function to avoid RLS recursion issues
      const { data, error } = await supabase
        .rpc('get_profile_by_user_id', { user_id: userId })
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        toast({
          title: "Error!",
          description: "Failed to fetch user profile. " + error.message,
        });
        
        // If profile doesn't exist, try to create it
        if (error.code === 'PGRST116') { // No results found error
          console.log('No profile found, creating new profile for user:', userId);
          
          const { error: createError } = await supabase
            .from('user_profiles')
            .insert({
              id: userId,
              is_onboarding_complete: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            
          if (createError) {
            console.error('Error creating profile:', createError);
            
            // If it's a duplicate key error, that might mean the profile was created in parallel
            if (createError.code === '23505') {
              console.log('Profile might have been created in parallel, trying to fetch again');
              const { data: retryData, error: retryError } = await supabase
                .rpc('get_profile_by_user_id', { user_id: userId })
                .maybeSingle();
                
              if (retryError) {
                console.error('Error on retry fetch:', retryError);
                return;
              }
              
              if (retryData) {
                console.log('Successfully retrieved profile on retry');
                setProfile(retryData as Profile);
                setIsOnboardingComplete(retryData?.is_onboarding_complete ?? false);
                return;
              }
            } else {
              console.error('Non-duplicate error creating profile:', createError);
              return;
            }
          } else {
            console.log('Profile created successfully, fetching it');
            const { data: newData, error: newFetchError } = await supabase
              .rpc('get_profile_by_user_id', { user_id: userId })
              .maybeSingle();
              
            if (newFetchError) {
              console.error('Error fetching newly created profile:', newFetchError);
              return;
            }
            
            if (newData) {
              console.log('Retrieved newly created profile');
              setProfile(newData as Profile);
              setIsOnboardingComplete(newData?.is_onboarding_complete ?? false);
            }
          }
        }
      } else if (data) {
        // Properly transform mood_settings to ensure type safety
        let moodSettings = null;
        
        if (data.mood_settings) {
          try {
            // Convert the JSON to a proper object we can safely access
            const settings = typeof data.mood_settings === 'object' 
              ? data.mood_settings as Record<string, any>
              : {};
              
            moodSettings = {
              showAvatar: typeof settings.showAvatar === 'boolean' 
                ? settings.showAvatar 
                : settings.showAvatar === 'true',
              defaultMood: typeof settings.defaultMood === 'string'
                ? settings.defaultMood
                : String(settings.defaultMood || 'neutral')
            };
          } catch (e) {
            console.error('Error parsing mood_settings:', e);
            // Fallback to default mood settings
            moodSettings = {
              showAvatar: true,
              defaultMood: 'neutral'
            };
          }
        }
        
        const formattedProfile: Profile = {
          ...data,
          mood_settings: moodSettings
        };
        
        setProfile(formattedProfile);
        setIsOnboardingComplete(data?.is_onboarding_complete ?? false);
        console.log('Successfully fetched and set user profile:', data.id);
      } else {
        // Profile doesn't exist, create it
        console.log('No profile found, creating new profile for user:', userId);
        
        const { error: createError } = await supabase
          .from('user_profiles')
          .insert({
            id: userId,
            is_onboarding_complete: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (createError) {
          console.error('Error creating profile:', createError);
          if (createError.code === '23505') {
            console.log('Profile already exists (duplicate key), trying to fetch again');
            // If it's a duplicate key error, try fetching once more
            const { data: retryData, error: retryError } = await supabase
              .rpc('get_profile_by_user_id', { user_id: userId })
              .maybeSingle();
              
            if (retryError) {
              console.error('Error on retry fetch after duplicate key:', retryError);
              return;
            }
            
            if (retryData) {
              setProfile(retryData as Profile);
              setIsOnboardingComplete(retryData?.is_onboarding_complete ?? false);
            }
          }
        } else {
          // Fetch the newly created profile
          const { data: newData, error: newFetchError } = await supabase
            .rpc('get_profile_by_user_id', { user_id: userId })
            .maybeSingle();
            
          if (newFetchError) {
            console.error('Error fetching newly created profile:', newFetchError);
            return;
          }
          
          setProfile(newData as Profile);
          setIsOnboardingComplete(newData?.is_onboarding_complete ?? false);
        }
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
    refreshSession
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
