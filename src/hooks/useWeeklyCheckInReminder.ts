
import { useState, useEffect } from 'react';
import { startOfWeek, isAfter, nextSunday, isSameWeek, addDays } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useWeeklyCheckInReminder = () => {
  const { user } = useAuth();
  const [showReminder, setShowReminder] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if user has completed a check-in this week
  useEffect(() => {
    const checkForWeeklyCheckIn = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Get the start of the current week (Sunday)
        const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
        
        // Check if a weekly check-in exists for the current week
        const { data, error } = await supabase
          .from('weekly_check_ins')
          .select('checkin_date')
          .eq('user_id', user.id)
          .gte('checkin_date', currentWeekStart.toISOString().split('T')[0])
          .order('checkin_date', { ascending: false })
          .limit(1);
          
        if (error) {
          console.error('Error checking weekly check-in:', error);
          return;
        }
        
        // If no data or empty array, user hasn't checked in this week
        const hasCheckedInThisWeek = data.length > 0;
        
        // Get the last reminder shown timestamp from localStorage
        const lastReminderShown = localStorage.getItem('lastCheckInReminderShown');
        
        // By default, show the reminder if they haven't checked in this week
        let shouldShowReminder = !hasCheckedInThisWeek;
        
        // If we have shown a reminder this week already, don't show again
        if (shouldShowReminder && lastReminderShown) {
          const lastReminderDate = new Date(lastReminderShown);
          
          // Check if the last reminder was shown in this week
          // If it was shown this week, don't show again
          if (isSameWeek(lastReminderDate, new Date(), { weekStartsOn: 0 })) {
            shouldShowReminder = false;
          }
        }
        
        // If they checked in in a previous week (not this one),
        // and the last reminder is from a previous week,
        // then we should show the reminder
        setShowReminder(shouldShowReminder);
      } catch (error) {
        console.error('Error in check-in reminder:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkForWeeklyCheckIn();
  }, [user]);
  
  // Function to dismiss the reminder
  const dismissReminder = () => {
    setShowReminder(false);
    // Save the current timestamp to localStorage to prevent showing again this week
    localStorage.setItem('lastCheckInReminderShown', new Date().toISOString());
  };
  
  return {
    showReminder,
    isLoading,
    dismissReminder
  };
};
