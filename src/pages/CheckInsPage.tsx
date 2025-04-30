
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CheckInsByDate from '@/components/check-ins/CheckInsByDate';
import RecentCheckIns from '@/components/check-ins/RecentCheckIns';
import CheckInForm from '@/components/check-ins/CheckInForm';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, BarChart } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import WeeklyCheckInsSection from '@/components/check-ins/WeeklyCheckInsSection';
import WeeklyCheckInInsights from '@/components/check-ins/WeeklyCheckInInsights';
import { useMoodHistory } from '@/hooks/useMoodHistory';
import MoodHistoryChart from '@/components/moods/MoodHistoryChart';

const CheckInsPage = () => {
  useDocumentTitle('Check-Ins | HeartNest');
  const [isCheckInFormOpen, setIsCheckInFormOpen] = useState(false);
  const { moodHistory, isFetchingHistory } = useMoodHistory();
  
  const handleCheckInSaved = () => {
    setIsCheckInFormOpen(false);
  };
  
  return (
    <div className="container mx-auto max-w-4xl py-4 sm:py-8 px-3 sm:px-4">
      <Tabs defaultValue="daily" className="w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Check-Ins</h1>
            <p className="text-muted-foreground">Track your relationship's daily and weekly progress</p>
          </div>
          
          <div className="flex gap-2">
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
            </TabsList>
          </div>
        </div>
        
        <TabsContent value="daily" className="mt-4 space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl sm:text-2xl font-bold">Daily Check-ins</h2>
            <Button 
              onClick={() => setIsCheckInFormOpen(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-love-500 to-harmony-500 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Check-in
            </Button>
          </div>
          
          {isCheckInFormOpen && (
            <div className="w-full">
              <CheckInForm 
                onCheckInSaved={handleCheckInSaved}
              />
            </div>
          )}
          
          <MoodHistoryChart moodHistory={moodHistory} isLoading={isFetchingHistory} />
          
          <RecentCheckIns />
        </TabsContent>
        
        <TabsContent value="weekly" className="mt-4">
          <WeeklyCheckInsSection />
        </TabsContent>
        
        <TabsContent value="insights" className="mt-4">
          <div className="space-y-6">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <BarChart className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold">Relationship Insights</h2>
              </div>
              <WeeklyCheckInInsights />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="calendar" className="mt-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Check-In Calendar</h2>
            </div>
            <CheckInsByDate />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CheckInsPage;
