
import { Session, User } from '@supabase/supabase-js';

export type Profile = {
  id: string;
  user_id?: string;
  partner_id?: string | null;
  is_onboarding_complete: boolean;
  love_language: string | null;
  communication_style: string | null;
  emotional_needs: string | null;
  relationship_goals: string | null;
  financial_attitude: string | null;
  full_name: string | null;
  created_at: string;
  updated_at: string;
  location: string | null;
  bio: string | null;
  mood_settings: {
    showAvatar?: boolean;
    defaultMood?: string;
  } | null;
};

export type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isOnboardingComplete: boolean | null;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  updateOnboardingStatus: (isComplete: boolean) => Promise<{ error: any | null } | undefined>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: any | null } | undefined>;
  fetchUserProfile: (userId: string) => Promise<void>;
};
