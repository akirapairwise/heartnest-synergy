
export type OnboardingFormData = {
  full_name: string;
  nickname: string;
  location: string;
  bio: string;
  love_language: string;
  communication_style: string;
  emotional_needs: string;
  relationship_goals: string;
  financial_attitude: string;
  notification_preferences: {
    reminders: boolean;
    tips: boolean;
    partner_updates: boolean;
  };
  ai_consent: boolean;
  // New relationship profile fields
  pronouns?: string;
  relationship_status?: string;
  relationship_start_date?: string;
  living_together?: string;
  interaction_frequency?: string;
  preferred_communication?: string;
  areas_to_improve?: string[];
  // Optional personalization
  love_language_preference?: string;
  conflict_resolution_style?: string;
  shared_goals?: string[];
  [key: string]: any;
};

export const initialFormData: OnboardingFormData = {
  full_name: "",
  nickname: "",
  location: "",
  bio: "",
  love_language: "",
  communication_style: "",
  emotional_needs: "",
  relationship_goals: "",
  financial_attitude: "",
  notification_preferences: {
    reminders: true,
    tips: true,
    partner_updates: true
  },
  ai_consent: true,
  // New relationship profile fields with defaults
  pronouns: "",
  relationship_status: "",
  relationship_start_date: "",
  living_together: "",
  interaction_frequency: "",
  preferred_communication: "",
  areas_to_improve: [],
  // Optional personalization
  love_language_preference: "",
  conflict_resolution_style: "",
  shared_goals: []
};
