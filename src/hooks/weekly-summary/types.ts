
export type SummaryState =
  | { status: 'idle', summary: null, error: null }
  | { status: 'loading', summary: null, error: null }
  | { status: 'success', summary: string, error: null }
  | { status: 'error', summary: null, error: string }
  | { status: 'insufficient_data', summary: null, error: null };

export type WeeklySummaryData = {
  mood_logs: string[];
  goal_updates: string[];
  shared_moments: string[];
  relationship_context: {
    status: string;
    goals: string;
    areas_to_improve: string;
    shared_goals: string;
  };
};
