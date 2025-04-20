
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
  nickname: string | null;
  created_at: string;
  updated_at: string;
  location: string | null;
  bio: string | null;
  avatar_url?: string | null;
  mood_settings: {
    showAvatar?: boolean;
    defaultMood?: string;
    isVisibleToPartner?: boolean;
  } | null;
  // New relationship profile fields
  pronouns?: string | null;
  relationship_status?: string | null;
  relationship_start_date?: string | null;
  living_together?: string | null;
  interaction_frequency?: string | null;
  preferred_communication?: string | null;
  areas_to_improve?: string[] | null;
  profile_complete_stage?: 'basic' | 'complete' | null;
  // Optional personalization fields
  love_language_preference?: string | null;
  conflict_resolution_style?: string | null;
  shared_goals?: string[] | null;
};

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
