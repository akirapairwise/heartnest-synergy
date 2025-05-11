
import React from 'react';
import { Notification } from '@/types/notifications';
import { cn } from '@/lib/utils';
import { 
  Heart, 
  CalendarCheck, 
  AlertCircle, 
  UserPlus, 
  Bell, 
  X 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete
}) => {
  const navigate = useNavigate();
  
  // Format the timestamp to a readable format
  const formattedDate = new Date(notification.createdAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
  
  const handleClick = () => {
    // Mark as read
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'daily_mood_reminder':
        navigate('/moods');
        break;
      case 'weekly_checkin_reminder':
        navigate('/check-ins');
        break;
      case 'new_conflict':
        if (notification.relatedId) {
          navigate(`/conflicts/${notification.relatedId}`);
        } else {
          navigate('/dashboard');
        }
        break;
      case 'partner_request':
        navigate('/connect');
        break;
      default:
        // For other types, just mark as read
        break;
    }
  };
  
  // Get icon based on notification type
  const getIcon = () => {
    switch (notification.type) {
      case 'daily_mood_reminder':
        return <Heart className="h-4 w-4 text-love-500" />;
      case 'weekly_checkin_reminder':
        return <CalendarCheck className="h-4 w-4 text-harmony-500" />;
      case 'new_conflict':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'partner_request':
        return <UserPlus className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };
  
  return (
    <div 
      className={cn(
        "flex items-start p-3 gap-3 hover:bg-muted/50 cursor-pointer transition-colors rounded-md",
        !notification.isRead && "bg-muted/50"
      )}
    >
      <div className="flex-shrink-0 mt-1">
        {getIcon()}
      </div>
      
      <div className="flex-1" onClick={handleClick}>
        <p className={cn("text-sm font-medium", !notification.isRead && "font-semibold")}>
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{formattedDate}</p>
      </div>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 flex-shrink-0 touch-manipulation"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(notification.id);
        }}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Delete</span>
      </Button>
    </div>
  );
};

export default NotificationItem;
