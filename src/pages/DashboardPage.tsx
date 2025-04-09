
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/AuthContext';
import MoodDisplay from '@/components/dashboard/MoodDisplay';
import GoalsCard from '@/components/dashboard/GoalsCard';
import InsightsCard from '@/components/dashboard/InsightsCard';
import PartnerCard from '@/components/dashboard/PartnerCard';
import MyGoalsSection from '@/components/dashboard/MyGoalsSection';
import PartnerGoalsSection from '@/components/dashboard/PartnerGoalsSection';
import CheckInsSection from '@/components/dashboard/CheckInsSection';
import ConflictsSection from '@/components/dashboard/ConflictsSection';
import SuggestionsSection from '@/components/dashboard/SuggestionsSection';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Skeleton } from '@/components/ui/skeleton';

const DashboardPage = () => {
  const { profile, isLoading } = useAuth();
  const userName = profile?.full_name || 'Partner';
  const [activeTab, setActiveTab] = useState('overview');
  
  useDocumentTitle('Dashboard | HeartNest');

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Welcome, {userName}</h1>
              <p className="text-muted-foreground">Here's an overview of your relationship</p>
            </div>
          </div>
          
          <Tabs 
            defaultValue="overview" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full mb-6 flex justify-start overflow-x-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="my-goals">My Goals</TabsTrigger>
              <TabsTrigger value="partner-goals">Partner Goals</TabsTrigger>
              <TabsTrigger value="check-ins">Check-Ins</TabsTrigger>
              <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
              <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              {/* Summary cards in a cleaner grid layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <MoodDisplay />
                <GoalsCard />
                <div className="sm:hidden lg:block">
                  <PartnerCard />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <InsightsCard />
                <div className="hidden sm:block lg:hidden">
                  <PartnerCard />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="my-goals" className="mt-6">
              <MyGoalsSection />
            </TabsContent>
            
            <TabsContent value="partner-goals" className="mt-6">
              <PartnerGoalsSection />
            </TabsContent>
            
            <TabsContent value="check-ins" className="mt-6">
              <CheckInsSection />
            </TabsContent>
            
            <TabsContent value="conflicts" className="mt-6">
              <ConflictsSection />
            </TabsContent>
            
            <TabsContent value="suggestions" className="mt-6">
              <SuggestionsSection />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

const DashboardSkeleton = () => (
  <div className="space-y-6 max-w-6xl mx-auto">
    <div className="space-y-2">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-5 w-48" />
    </div>
    
    <Skeleton className="h-10 w-full rounded-lg mb-6" />
    
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      <Skeleton className="h-[150px] w-full rounded-xl" />
      <Skeleton className="h-[150px] w-full rounded-xl" />
      <Skeleton className="h-[150px] w-full rounded-xl" />
    </div>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      <Skeleton className="h-[220px] w-full rounded-xl" />
      <Skeleton className="h-[220px] w-full rounded-xl" />
    </div>
  </div>
);

export default DashboardPage;
