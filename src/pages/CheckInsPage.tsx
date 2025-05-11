
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CheckInsByDate from '@/components/check-ins/CheckInsByDate';
import RecentCheckIns from '@/components/check-ins/RecentCheckIns';
import CheckInForm from '@/components/check-ins/CheckInForm';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, BarChart, X } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import WeeklyCheckInsSection from '@/components/check-ins/WeeklyCheckInsSection';
import WeeklyCheckInInsights from '@/components/check-ins/WeeklyCheckInInsights';
import { useMoodHistory } from '@/hooks/useMoodHistory';
import MoodHistoryChart from '@/components/moods/MoodHistoryChart';
import { useMediaQuery } from '@/hooks/use-media-query';

const CheckInsPage = () => {
  useDocumentTitle('Check-Ins | HeartNest');
  const [isCheckInFormOpen, setIsCheckInFormOpen] = useState(false);
  const { moodHistory, isFetchingHistory } = useMoodHistory();
  const isMobile = useMediaQuery("(max-width: 640px)");
  
  const handleCheckInSaved = () => {
    setIsCheckInFormOpen(false);
  };
  
  return (
    <div className="container mx-auto max-w-4xl py-3 sm:py-6 md:py-8 px-3 sm:px-4">
      <Tabs defaultValue="daily" className="w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Check-Ins</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Track your relationship's daily and weekly progress</p>
          </div>
          
          <div className="flex w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 -mr-3 sm:mr-0 px-0.5">
            <TabsList className="w-full sm:w-auto justify-start sm:justify-center">
              <TabsTrigger value="daily" className="text-xs sm:text-sm px-3 sm:px-4">Daily</TabsTrigger>
              <TabsTrigger value="weekly" className="text-xs sm:text-sm px-3 sm:px-4">Weekly</TabsTrigger>
              <TabsTrigger value="insights" className="text-xs sm:text-sm px-3 sm:px-4">Insights</TabsTrigger>
              <TabsTrigger value="calendar" className="text-xs sm:text-sm px-3 sm:px-4">Calendar</TabsTrigger>
            </TabsList>
          </div>
        </div>
        
        <TabsContent value="daily" className="mt-2 sm:mt-4 space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <h2 className="text-xl sm:text-2xl font-bold">Daily Check-ins</h2>
            <Button 
              onClick={() => setIsCheckInFormOpen(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-love-500 to-harmony-500 text-white"
              disabled={isCheckInFormOpen}
              size={isMobile ? "sm" : "default"}
            >
              <Plus className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              New Check-in
            </Button>
          </div>
          
          {isCheckInFormOpen && (
            <div className="relative w-full py-1 sm:py-2">
              <div className="flex justify-end mb-1 sm:mb-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsCheckInFormOpen(false)}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full"
                >
                  <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>
              <CheckInForm onCheckInSaved={handleCheckInSaved} />
            </div>
          )}
          
          <div className="rounded-lg overflow-hidden border p-2 sm:p-4">
            <MoodHistoryChart moodHistory={moodHistory} isLoading={isFetchingHistory} />
          </div>
          
          <RecentCheckIns />
        </TabsContent>
        
        <TabsContent value="weekly" className="mt-2 sm:mt-4">
          <WeeklyCheckInsSection />
        </TabsContent>
        
        <TabsContent value="insights" className="mt-2 sm:mt-4">
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-3 sm:mb-4 md:mb-6">
                <BarChart className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Relationship Insights</h2>
              </div>
              <WeeklyCheckInInsights />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="calendar" className="mt-2 sm:mt-4">
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-3 sm:mb-4 md:mb-6">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Check-In Calendar</h2>
            </div>
            <CheckInsByDate />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CheckInsPage;
