
export type Goal = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  status: string;
  is_shared: boolean;
  goal_type: 'personal' | 'shared';
  owner_id: string;
  partner_id: string | null;
  created_at: string;
  updated_at: string;
  // New fields
  milestones: string[] | null;
  deadline: string | null;
  // Computed properties for UI
  progress?: number;
  completed?: boolean;
  // Owner information
  owner_name?: string;
  is_self_owned?: boolean;
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
