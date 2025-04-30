
import { useState, useEffect } from 'react';
import { startOfWeek, isAfter, nextSunday, isSameDay, addDays, isSunday } from 'date-fns';
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
        
        // Get the most recent check-in
        const { data, error } = await supabase
          .from('weekly_check_ins')
          .select('checkin_date')
          .eq('user_id', user.id)
          .order('checkin_date', { ascending: false })
          .limit(1);
          
        if (error) {
          console.error('Error checking weekly check-in:', error);
          return;
        }

        const today = new Date();
        
        // Calculate when the next check-in reminder should show
        let shouldShowReminder = false;
        
        // If no previous check-ins, show reminder only on Sunday
        if (data.length === 0) {
          shouldShowReminder = isSunday(today);
        } else {
          // Get the date of the most recent check-in
          const lastCheckInDate = new Date(data[0].checkin_date);
          
          // Calculate the next Sunday after the last check-in
          const nextReminderDate = nextSunday(lastCheckInDate);
          
          // Show reminder if today is the next Sunday after the last check-in
          shouldShowReminder = isSunday(today) && isAfter(today, nextReminderDate);
        }
        
        // Check if we've already shown the reminder today (to prevent showing on every login)
        if (shouldShowReminder) {
          const lastReminderShown = localStorage.getItem('lastCheckInReminderShown');
          
          if (lastReminderShown) {
            const lastReminderDate = new Date(lastReminderShown);
            
            // If we've already shown a reminder today, don't show again
            if (isSameDay(lastReminderDate, today)) {
              shouldShowReminder = false;
            }
          }
        }
        
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
    // Save the current timestamp to localStorage to prevent showing again today
    localStorage.setItem('lastCheckInReminderShown', new Date().toISOString());
  };
  
  return {
    showReminder,
    isLoading,
    dismissReminder
  };
};
