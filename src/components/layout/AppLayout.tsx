
import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';

const AppLayout = () => {
  const { user, isLoading, refreshSession } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isPageReady, setIsPageReady] = useState(false);
  const [hasAttemptedRefresh, setHasAttemptedRefresh] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null);
  const isMobile = useIsMobile();
  
  // Set up a maximum loading time of 5 seconds
  useEffect(() => {
    if (isLoading && !loadingTimeout) {
      const timeout = setTimeout(() => {
        setIsPageReady(true);
        console.log('Loading timeout reached in AppLayout');
      }, 5000);
      
      setLoadingTimeout(timeout);
      return () => {
        if (timeout) clearTimeout(timeout);
      };
    }
    
    if (!isLoading && loadingTimeout) {
      clearTimeout(loadingTimeout);
      setLoadingTimeout(null);
    }
  }, [isLoading, loadingTimeout]);
  
  // Check authentication status and refresh if needed
  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoading) {
        if (!user && !hasAttemptedRefresh) {
          console.log('No user in AppLayout, attempting to refresh session');
          setHasAttemptedRefresh(true);
          await refreshSession();
          
          // If still no user after refresh, redirect to auth
          if (!user) {
            toast.error("Authentication required", {
              description: "Please log in to continue"
            });
            navigate('/auth', { replace: true, state: { from: location.pathname } });
          } else {
            setIsPageReady(true);
          }
        } else {
          setIsPageReady(true);
          
          // Set up realtime listeners for relevant tables
          const channel = supabase
            .channel('schema-db-changes')
            .on('postgres_changes', 
              { event: '*', schema: 'public' }, 
              (payload) => {
                console.log('Database change detected:', payload);
                // Specific components will handle their own refresh logic
              }
            )
            .subscribe((status) => {
              console.log('Realtime subscription status:', status);
            });
            
          // Set up realtime listeners for notifications
          if (user) {
            const notificationsChannel = supabase
              .channel('notifications-channel')
              .on('postgres_changes', 
                { 
                  event: 'INSERT', 
                  schema: 'public', 
                  table: 'notifications',
                  filter: `user_id=eq.${user.id}` 
                }, 
                (payload) => {
                  console.log('New notification received:', payload);
                  
                  // Show a toast for the new notification with mobile-friendly positioning
                  if (payload.new) {
                    toast.message(payload.new.title, {
                      description: payload.new.message,
                      position: isMobile ? "bottom-center" : "top-right",
                      action: {
                        label: "View",
                        onClick: () => {
                          // Navigate based on notification type
                          switch(payload.new.type) {
                            case 'daily_mood_reminder':
                              navigate('/moods');
                              break;
                            case 'weekly_checkin_reminder':
                              navigate('/check-ins');
                              break;
                            case 'new_conflict':
                              if (payload.new.related_id) {
                                navigate(`/conflicts/${payload.new.related_id}`);
                              } else {
                                navigate('/dashboard');
                              }
                              break;
                            default:
                              // Default to dashboard
                              break;
                          }
                        }
                      }
                    });
                  }
                }
              )
              .subscribe();
              
            return () => {
              supabase.removeChannel(channel);
              supabase.removeChannel(notificationsChannel);
            };
          }
          
          return () => {
            supabase.removeChannel(channel);
          };
        }
      }
    };
    
    checkAuth();
  }, [user, isLoading, navigate, location.pathname, refreshSession, hasAttemptedRefresh, isMobile]);

  // Show loading when authenticating, but not indefinitely
  if (isLoading && !isPageReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center px-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto pb-16 md:pb-6 safe-bottom">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
