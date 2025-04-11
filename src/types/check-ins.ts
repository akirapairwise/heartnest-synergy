
export type CheckIn = {
  id: string;
  mood: string;
  reflection: string | null;
  satisfaction_rating: number;
  timestamp: string;
  user_id?: string;
};

export type MoodOption = {
  value: string;
  label: string;
  icon: React.ReactNode;
  color: string;
};

// Add a consistent mood tracking type
export type MoodEntry = {
  id: string;
  date: string;
  mood: number;
  note?: string | null;
  is_visible_to_partner?: boolean;
};
