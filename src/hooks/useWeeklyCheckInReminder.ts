
import { useState, useEffect } from 'react';
import { startOfWeek, isAfter } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useWeeklyCheckInReminder = () => {
  const { user } = useAuth();
  const [showReminder, setShowReminder] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
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
        
        // Get the start of the current week (Monday)
        const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
        
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
        setShowReminder(data.length === 0);
        
        // Get the last reminder shown timestamp from localStorage
        const lastReminderShown = localStorage.getItem('lastCheckInReminderShown');
        
        // If we have shown a reminder this week already, don't show again
        if (lastReminderShown) {
          const lastReminderDate = new Date(lastReminderShown);
          if (isAfter(lastReminderDate, currentWeekStart)) {
            setShowReminder(false);
          }
        }
      } catch (error) {
        console.error('Error in check-in reminder:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkForWeeklyCheckIn();
  }, [user]);
  
  // Function to open the check-in form
  const openCheckInForm = () => {
    setIsFormOpen(true);
    // Save the current timestamp to localStorage to prevent showing again this week
    localStorage.setItem('lastCheckInReminderShown', new Date().toISOString());
    setShowReminder(false);
  };
  
  // Function to dismiss the reminder
  const dismissReminder = () => {
    setShowReminder(false);
    // Save the current timestamp to localStorage to prevent showing again this week
    localStorage.setItem('lastCheckInReminderShown', new Date().toISOString());
  };
  
  // Function to handle successful check-in
  const handleCheckInComplete = () => {
    setIsFormOpen(false);
    toast.success("Check-in saved!", {
      description: "Thank you for completing your weekly check-in."
    });
  };
  
  return {
    showReminder,
    isFormOpen,
    isLoading,
    openCheckInForm,
    dismissReminder,
    setIsFormOpen,
    handleCheckInComplete
  };
};
