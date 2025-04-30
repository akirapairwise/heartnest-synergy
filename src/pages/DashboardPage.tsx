
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/AuthContext';
import MoodDisplay from '@/components/dashboard/MoodDisplay';
import GoalsCard from '@/components/dashboard/GoalsCard';
import InsightsCard from '@/components/dashboard/InsightsCard';
import PartnerCard from '@/components/dashboard/PartnerCard';
import MyGoalsSection from '@/components/dashboard/MyGoalsSection';
import CheckInsSection from '@/components/dashboard/CheckInsSection';
import ConflictsSection from '@/components/dashboard/ConflictsSection';
import SuggestionsSection from '@/components/dashboard/SuggestionsSection';
import WeeklyCheckInReminder from '@/components/dashboard/WeeklyCheckInReminder';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Skeleton } from '@/components/ui/skeleton';
import { usePartnerInvite } from '@/hooks/usePartnerInvite';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UpcomingEventsSection from '@/components/events/UpcomingEventsSection';
import SuggestedActivitiesCard from '@/components/dashboard/SuggestedActivitiesCard';

const DashboardPage = () => {
  const { profile, isLoading } = useAuth();
  const { activeInvite, refreshInvites } = usePartnerInvite();
  const navigate = useNavigate();
  
  useDocumentTitle('Dashboard | HeartNest');

  // Get user's nickname or default to first name from full name or 'Partner'
  const getUserDisplayName = () => {
    if (profile?.nickname) {
      return profile.nickname;
    } else if (profile?.full_name) {
      // Extract first name from full name
      return profile.full_name.split(' ')[0];
    } else {
      return 'Partner';
    }
  };
  
  const userName = getUserDisplayName();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Refresh invites when dashboard loads
    if (profile) {
      refreshInvites();
    }
  }, [profile, refreshInvites]);

  const hasPartner = Boolean(profile?.partner_id);

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
            
            {!hasPartner && !activeInvite && (
              <Button 
                onClick={() => navigate('/connect')}
                className="hidden sm:flex items-center gap-2"
                size="sm"
              >
                <UserPlus className="h-4 w-4" />
                Connect Partner
              </Button>
            )}
          </div>
          
          {/* Add Weekly Check-In Reminder */}
          <WeeklyCheckInReminder />
          
          <Tabs 
            defaultValue="overview" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full mb-6 flex justify-start overflow-x-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="my-goals">My Goals</TabsTrigger>
              <TabsTrigger value="check-ins">Check-Ins</TabsTrigger>
              <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
              <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
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
              
              {/* Make the insights card take more width */}
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <InsightsCard />
                <div className="hidden sm:block lg:hidden">
                  <PartnerCard />
                </div>
              </div>
              
              <SuggestedActivitiesCard />
              
              <UpcomingEventsSection />
              
              {!hasPartner && !activeInvite && (
                <div className="sm:hidden">
                  <Button 
                    onClick={() => navigate('/connect')}
                    className="w-full mt-4"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Connect Partner
                  </Button>
                </div>
              )}
            </TabsContent>
            
            {/* Other tab content */}
            <TabsContent value="events">
              <div className="max-w-4xl mx-auto">
                <UpcomingEventsSection />
              </div>
            </TabsContent>
            
            <TabsContent value="my-goals" className="mt-6">
              <MyGoalsSection />
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
    
    <div className="grid grid-cols-1 gap-4 sm:gap-6">
      <Skeleton className="h-[220px] w-full rounded-xl" />
    </div>
  </div>
);

export default DashboardPage;
