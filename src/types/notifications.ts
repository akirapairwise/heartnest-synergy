
export type NotificationType = 
  | 'daily_mood_reminder' 
  | 'weekly_checkin_reminder' 
  | 'new_conflict'
  | 'partner_request'
  | 'system_message'
  | 'partner_mood_update'   // New notification type
  | 'partner_goal_update'   // New notification type  
  | 'partner_event_update'; // New notification type

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
}
