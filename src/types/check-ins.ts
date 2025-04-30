
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
  timestamp?: string; // Added timestamp field for tracking time of update
};

// Add weekly check-in type
export type WeeklyCheckIn = {
  id: string;
  user_id: string;
  mood: string;
  connection_level: number;
  communication_rating: number;
  reflection_note: string | null;
  is_visible_to_partner: boolean;
  checkin_date: string;
};

// Add mood chart types for visualization
export type MoodChartData = {
  date: string;
  formattedDate: string;
  mood: number | null;
};

export type RelationshipMetric = {
  connection: number;
  communication: number;
  mood: number;
  date: string;
};

export type WeeklyInsightSummary = {
  emotionalJourney: string;
  growthInsights: string;
  suggestedFocus: string;
};
