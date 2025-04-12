
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckInsByDate } from '@/components/check-ins/CheckInsByDate';
import { RecentCheckIns } from '@/components/check-ins/RecentCheckIns';
import { CheckInModal } from '@/components/check-ins/CheckInModal';
import { Button } from '@/components/ui/button';
import { Plus, Calendar } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import WeeklyCheckInsSection from '@/components/check-ins/WeeklyCheckInsSection';

const CheckInsPage = () => {
  useDocumentTitle('Check-Ins | HeartNest');
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
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
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
            </TabsList>
          </div>
        </div>
        
        <TabsContent value="daily" className="mt-4 space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Daily Check-ins</h2>
            <Button 
              onClick={() => setIsCheckInModalOpen(true)}
              className="bg-gradient-to-r from-love-500 to-harmony-500 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Check-in
            </Button>
          </div>
          
          <RecentCheckIns />
          
          <CheckInModal 
            open={isCheckInModalOpen} 
            onOpenChange={setIsCheckInModalOpen} 
          />
        </TabsContent>
        
        <TabsContent value="weekly" className="mt-4">
          <WeeklyCheckInsSection />
        </TabsContent>
        
        <TabsContent value="calendar" className="mt-4">
          <div className="bg-white p-6 rounded-lg shadow-sm">
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
