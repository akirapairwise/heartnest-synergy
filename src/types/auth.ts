
import { Session, User } from '@supabase/supabase-js';

// User profile type
export interface Profile {
  id: string;
  is_onboarding_complete: boolean;
  love_language?: string;
  communication_style?: string;
  relationship_length?: string;
  current_challenges?: string[];
  current_victories?: string[];
  full_name?: string;
  nickname?: string;
  phone_number?: string;
  email?: string;
  avatar_url?: string;
  partner_id?: string;
  updated_at?: string;
  created_at?: string;
  relationship_status?: string;
  living_situation?: string;
  mood_settings?: {
    isVisibleToPartner?: boolean;
    [key: string]: any;
  };
  // Additional profile fields
  pronouns?: string;
  location?: string;
  bio?: string;
  relationship_start_date?: string;
  living_together?: string;
  interaction_frequency?: string;
  preferred_communication?: string;
  emotional_needs?: string;
  relationship_goals?: string;
  areas_to_improve?: string[];
  financial_attitude?: string;
  conflict_resolution_style?: string;
  // Date fields
  anniversary_date?: string;
  birthday_date?: string;
}

// Auth context type
export interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isOnboardingComplete: boolean | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateOnboardingStatus: (isComplete: boolean) => Promise<{ error: any }>;
  updateProfile: (profileData: Partial<Profile>) => Promise<{ data?: any; error: any }>;
  fetchUserProfile: (userId: string) => Promise<void>;
  refreshSession: () => Promise<void>;
}
