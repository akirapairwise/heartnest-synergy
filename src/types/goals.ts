
export type Goal = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  status: string;
  is_shared: boolean;
  owner_id: string;
  partner_id: string | null;
  created_at: string;
  updated_at: string;
  // Computed properties for UI
  progress?: number;
  completed?: boolean;
};

export type GoalCategory = 
  | 'communication'
  | 'quality-time'
  | 'adventure'
  | 'understanding'
  | 'growth'
  | 'intimacy';

export type GoalStatus = 
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled';
