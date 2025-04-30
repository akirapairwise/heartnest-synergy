
import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDailyCheckInReminder } from '@/hooks/useDailyCheckInReminder';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { useMediaQuery } from '@/hooks/use-media-query';
import MoodTracker from '@/components/moods/MoodTracker';
import { useDailyMood } from '@/hooks/useDailyMood';

const DailyCheckInReminder = () => {
  const navigate = useNavigate();
  const { showReminder, dismissReminder } = useDailyCheckInReminder();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { dailyMood, fetchDailyMood } = useDailyMood();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  
  if (!showReminder) {
    return null;
  }
  
  const handleCheckInClick = () => {
    setIsModalOpen(true);
  };
  
  const handleMoodSaved = () => {
    setIsModalOpen(false);
    dismissReminder();
    fetchDailyMood();
  };
  
  return (
    <>
      <Alert className="mb-6 bg-gradient-to-r from-love-50 to-harmony-50 border-love-200">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex items-start sm:items-center">
            <Heart className="h-5 w-5 text-love-500 mr-2 mt-0.5 sm:mt-0" />
            <div>
              <AlertTitle>How are you feeling today?</AlertTitle>
              <AlertDescription>
                Take a moment to check in and track your relationship mood.
              </AlertDescription>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button 
              variant="default" 
              size="sm"
              className="bg-love-500 hover:bg-love-600 text-white"
              onClick={handleCheckInClick}
            >
              Check In Now
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={dismissReminder}
              className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Dismiss</span>
            </Button>
          </div>
        </div>
      </Alert>
      
      {/* Responsive modal: Dialog for desktop, Drawer for mobile */}
      {isDesktop ? (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Daily Mood Check-In</DialogTitle>
            </DialogHeader>
            <MoodTracker 
              onMoodSaved={handleMoodSaved} 
              dailyMood={dailyMood}
            />
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DrawerContent className="max-h-[90vh] overflow-y-auto px-4">
            <DrawerHeader>
              <DrawerTitle>Daily Mood Check-In</DrawerTitle>
              <DrawerDescription>
                How are you feeling about your relationship today?
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4 pt-0">
              <MoodTracker 
                onMoodSaved={handleMoodSaved} 
                dailyMood={dailyMood}
              />
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
};

export default DailyCheckInReminder;
