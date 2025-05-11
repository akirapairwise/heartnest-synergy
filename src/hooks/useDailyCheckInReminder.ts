
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDailyMood } from './useDailyMood';
import { startOfDay, isAfter } from 'date-fns';

export const useDailyCheckInReminder = () => {
  const [showReminder, setShowReminder] = useState(false);
  const { user } = useAuth();
  const { todaysMood, isLoading } = useDailyMood();
  
  useEffect(() => {
    const checkReminderEligibility = () => {
      if (!user || isLoading) return;
      
      // If user has already completed a daily mood check-in today, don't show reminder
      if (todaysMood) {
        setShowReminder(false);
        return;
      }
      
      // Check if reminder was already dismissed today
      const lastDismissed = localStorage.getItem('lastDailyReminderDismissed');
      if (lastDismissed) {
        const lastDismissedDate = new Date(lastDismissed);
        const today = startOfDay(new Date());
        
        // If reminder was dismissed today, don't show it again
        if (isAfter(lastDismissedDate, today)) {
          setShowReminder(false);
          return;
        }
      }
      
      // Show reminder if user hasn't completed a check-in and hasn't dismissed the reminder today
      setShowReminder(true);
    };
    
    // Only check after we've loaded the dailyMood data
    if (!isLoading) {
      checkReminderEligibility();
    }
  }, [user, todaysMood, isLoading]);
  
  const dismissReminder = () => {
    setShowReminder(false);
    // Save the current timestamp to localStorage to prevent showing again today
    localStorage.setItem('lastDailyReminderDismissed', new Date().toISOString());
  };
  
  return {
    showReminder,
    dismissReminder
  };
};
