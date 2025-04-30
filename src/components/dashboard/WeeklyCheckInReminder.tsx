
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, CalendarCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWeeklyCheckInReminder } from '@/hooks/useWeeklyCheckInReminder';

const WeeklyCheckInReminder = () => {
  const navigate = useNavigate();
  const {
    showReminder,
    dismissReminder
  } = useWeeklyCheckInReminder();
  
  if (!showReminder) {
    return null;
  }
  
  const handleCheckInClick = () => {
    // Save the current timestamp to localStorage to prevent showing again today
    localStorage.setItem('lastCheckInReminderShown', new Date().toISOString());
    // Navigate to the check-ins page
    navigate('/check-ins');
  };
  
  return (
    <Alert className="mb-6 bg-muted/50 border-harmony-200">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <CalendarCheck className="h-5 w-5 text-harmony-500 mr-2" />
          <div>
            <AlertTitle>It's time for your weekly check-in</AlertTitle>
            <AlertDescription className="mr-4">
              Keep track of your relationship progress with your Sunday check-in. Your next reminder will appear in a week.
            </AlertDescription>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="default" 
            className="bg-harmony-500 hover:bg-harmony-600 text-white"
            onClick={handleCheckInClick}
          >
            Check In Now
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={dismissReminder}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </div>
      </div>
    </Alert>
  );
};

export default WeeklyCheckInReminder;
