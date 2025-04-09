
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/AuthContext';
import MoodCard from '@/components/dashboard/MoodCard';
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
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('my-goals');
  
  useDocumentTitle('Dashboard | HeartNest');

  return (
    <div className="animate-fade-in">
      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, {userName}</h1>
          <p className="text-muted-foreground mb-6">Here's an overview of your relationship</p>
          
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <div className="md:col-span-2 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <MoodCard />
                <GoalsCard />
              </div>
              <InsightsCard />
            </div>
            <div>
              <PartnerCard />
            </div>
          </div>
          
          {/* Detailed sections in tabs */}
          <div className="mt-8">
            <Tabs 
              defaultValue="my-goals" 
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className={`grid w-full ${isMobile ? 'grid-cols-3' : 'grid-cols-5'} mb-2`}>
                <TabsTrigger value="my-goals">My Goals</TabsTrigger>
                <TabsTrigger value="partner-goals">Partner Goals</TabsTrigger>
                {!isMobile && <TabsTrigger value="check-ins">Check-Ins</TabsTrigger>}
                {!isMobile && <TabsTrigger value="conflicts">Conflicts</TabsTrigger>}
                <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
              </TabsList>
              
              {isMobile && (
                <TabsList className="grid w-full grid-cols-2 mt-2">
                  <TabsTrigger value="check-ins">Check-Ins</TabsTrigger>
                  <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
                </TabsList>
              )}
              
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
          </div>
        </>
      )}
    </div>
  );
};

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-5 w-48" />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
      <div className="md:col-span-2 space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Skeleton className="h-[220px] w-full rounded-xl" />
          <Skeleton className="h-[220px] w-full rounded-xl" />
        </div>
        <Skeleton className="h-[260px] w-full rounded-xl" />
      </div>
      <Skeleton className="h-[500px] w-full rounded-xl" />
    </div>
    
    <div className="mt-8">
      <Skeleton className="h-10 w-full rounded-lg mb-6" />
      <Skeleton className="h-[400px] w-full rounded-xl" />
    </div>
  </div>
);

export default DashboardPage;
