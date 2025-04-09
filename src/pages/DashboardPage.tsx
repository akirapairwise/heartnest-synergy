
import React from 'react';
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

const DashboardPage = () => {
  const { profile } = useAuth();
  const userName = profile?.full_name || 'Partner';

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">Welcome back, {userName}</h1>
      <p className="text-muted-foreground mb-6">Here's an overview of your relationship</p>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
        <Tabs defaultValue="my-goals" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="my-goals">My Goals</TabsTrigger>
            <TabsTrigger value="partner-goals">Partner Goals</TabsTrigger>
            <TabsTrigger value="check-ins">Check-Ins</TabsTrigger>
            <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          </TabsList>
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
    </div>
  );
};

export default DashboardPage;
