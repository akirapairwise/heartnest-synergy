
import React from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationItem from './NotificationItem';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface NotificationsDropdownProps {
  className?: string;
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ className }) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll
  } = useNotifications();
  
  const isMobile = useMediaQuery("(max-width: 640px)");
  
  const notificationsList = (
    <ScrollArea className={isMobile ? "h-[calc(100vh-8rem)]" : "h-[300px]"}>
      {isLoading ? (
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-4 w-4 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length > 0 ? (
        notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={markAsRead}
            onDelete={removeNotification}
          />
        ))
      ) : (
        <div className="p-8 text-center">
          <p className="text-sm text-muted-foreground">No notifications yet</p>
        </div>
      )}
    </ScrollArea>
  );
  
  const header = (
    <div className="flex items-center justify-between p-4">
      <h3 className="font-medium">Notifications</h3>
      <Button
        variant="ghost"
        size="sm"
        className="text-xs"
        onClick={markAllAsRead}
        disabled={unreadCount === 0}
      >
        Mark all as read
      </Button>
    </div>
  );
  
  const footer = notifications.length > 0 ? (
    <>
      <DropdownMenuSeparator />
      <div className="p-2 text-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearAll} 
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Clear all
        </Button>
      </div>
    </>
  ) : null;
  
  // Use Sheet component on mobile for better UX
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className={`relative touch-manipulation ${className}`}>
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-love-500">
                {unreadCount > 9 && (
                  <span className="absolute -top-2 -right-2 text-[10px] font-bold bg-love-500 rounded-full h-4 w-4 flex items-center justify-center text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full max-w-full sm:max-w-md p-0">
          <SheetHeader className="border-b p-4">
            <SheetTitle>Notifications</SheetTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-4 top-4 text-xs"
                onClick={markAllAsRead}
              >
                Mark all as read
              </Button>
            )}
          </SheetHeader>
          {notificationsList}
          {notifications.length > 0 && (
            <div className="border-t p-4 text-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAll} 
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear all
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    );
  }
  
  // Use dropdown on desktop
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={`relative ${className}`}>
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 flex h-2 w-2 rounded-full bg-love-500">
              {unreadCount > 9 && (
                <span className="absolute -top-3 -right-3 text-[10px] font-bold bg-love-500 rounded-full h-4 w-4 flex items-center justify-center text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {header}
        <DropdownMenuSeparator />
        {notificationsList}
        {footer}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown;
