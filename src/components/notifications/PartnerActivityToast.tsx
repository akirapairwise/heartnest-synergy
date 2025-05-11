
import React, { useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Smile, Target, Calendar } from 'lucide-react';

const PartnerActivityToast = () => {
  const { notifications, markAsRead } = useNotifications();
  const { profile } = useAuth();
  
  useEffect(() => {
    // Only process if the user has a partner
    if (!profile?.partner_id) return;
    
    // Find unread partner activity notifications
    const unreadPartnerNotifications = notifications.filter(
      n => !n.isRead && (
        n.type === 'partner_mood_update' ||
        n.type === 'partner_goal_update' ||
        n.type === 'partner_event_update'
      )
    );
    
    // Show toast notifications for partner activities
    unreadPartnerNotifications.forEach(notification => {
      // Get proper icon based on notification type
      let icon;
      switch (notification.type) {
        case 'partner_mood_update':
          icon = <Smile className="h-5 w-5 text-green-500" />;
          break;
        case 'partner_goal_update':
          icon = <Target className="h-5 w-5 text-purple-500" />;
          break;
        case 'partner_event_update':
          icon = <Calendar className="h-5 w-5 text-cyan-500" />;
          break;
      }
      
      // Show toast notification
      toast(notification.title, {
        description: notification.message,
        icon,
        action: {
          label: "View",
          onClick: () => {
            // Mark as read when the user clicks on it
            markAsRead(notification.id);
            
            // Navigate based on type
            switch (notification.type) {
              case 'partner_mood_update':
                window.location.href = '/dashboard';
                break;
              case 'partner_goal_update':
                window.location.href = notification.relatedId ? 
                  `/goals?highlight=${notification.relatedId}` : 
                  '/goals';
                break;
              case 'partner_event_update':
                window.location.href = notification.relatedId ? 
                  `/event-suggestions?highlight=${notification.relatedId}` : 
                  '/event-suggestions';
                break;
            }
          }
        },
        onDismiss: () => {
          // Mark as read when dismissed
          markAsRead(notification.id);
        }
      });
      
      // Mark as read after displaying
      markAsRead(notification.id);
    });
  }, [notifications, markAsRead, profile]);
  
  // This component doesn't render anything visible
  return null;
};

export default PartnerActivityToast;
