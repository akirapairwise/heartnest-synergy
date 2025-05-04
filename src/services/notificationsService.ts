
import { supabase } from "@/integrations/supabase/client";
import { Notification, NotificationType } from "@/types/notifications";

export const fetchNotifications = async (userId: string): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
  
  // Convert from snake_case to camelCase
  return data.map((notification): Notification => ({
    id: notification.id,
    userId: notification.user_id,
    type: notification.type as NotificationType, // Add type assertion here
    title: notification.title,
    message: notification.message,
    relatedId: notification.related_id,
    isRead: notification.is_read,
    createdAt: notification.created_at
  }));
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);
    
  if (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId);
    
  if (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

export const deleteNotification = async (notificationId: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);
    
  if (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

export const clearAllNotifications = async (userId: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', userId);
    
  if (error) {
    console.error('Error clearing all notifications:', error);
    throw error;
  }
};

// Function to manually create a notification (useful for client-side events)
export const createNotification = async (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      related_id: notification.relatedId
    });
    
  if (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};
