
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, CalendarCheck } from 'lucide-react';
import WeeklyCheckInForm from '../check-ins/WeeklyCheckInForm';
import { useWeeklyCheckInReminder } from '@/hooks/useWeeklyCheckInReminder';

const WeeklyCheckInReminder = () => {
  const {
    showReminder,
    isFormOpen,
    openCheckInForm,
    dismissReminder,
    setIsFormOpen,
    handleCheckInComplete
  } = useWeeklyCheckInReminder();
  
  if (!showReminder) {
    return null;
  }
  
  return (
    <>
      <Alert className="mb-6 bg-muted/50 border-harmony-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <CalendarCheck className="h-5 w-5 text-harmony-500 mr-2" />
            <div>
              <AlertTitle>Don't forget your weekly check-in</AlertTitle>
              <AlertDescription className="mr-4">
                Keep track of your relationship progress by completing your weekly check-in.
              </AlertDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="default" 
              className="bg-harmony-500 hover:bg-harmony-600 text-white"
              onClick={openCheckInForm}
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
      
      <WeeklyCheckInForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onCheckInComplete={handleCheckInComplete}
      />
    </>
  );
};

export default WeeklyCheckInReminder;
