
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RecentWeeklyCheckIns from './RecentWeeklyCheckIns';
import WeeklyCheckInForm from './WeeklyCheckInForm';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const WeeklyCheckInsSection = () => {
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);
  
  const handleCheckInComplete = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Weekly Check-ins</h2>
          <p className="text-muted-foreground">Track your relationship progress week by week</p>
        </div>
        <Button 
          onClick={() => setIsFormOpen(true)} 
          className="bg-gradient-to-r from-love-500 to-harmony-500 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Check-in
        </Button>
      </div>
      
      <Tabs defaultValue="my-checkins" className="w-full">
        <TabsList>
          <TabsTrigger value="my-checkins">My Check-ins</TabsTrigger>
          <TabsTrigger value="partner-checkins">Partner's Check-ins</TabsTrigger>
        </TabsList>
        
        <TabsContent value="my-checkins" className="mt-6">
          <RecentWeeklyCheckIns key={refreshTrigger} />
        </TabsContent>
        
        <TabsContent value="partner-checkins" className="mt-6">
          <PartnerCheckIns />
        </TabsContent>
      </Tabs>
      
      <WeeklyCheckInForm 
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onCheckInComplete={handleCheckInComplete}
      />
    </div>
  );
};

// Component to display partner's check-ins
const PartnerCheckIns = () => {
  const { profile } = useAuth();
  const [partnerCheckIns, setPartnerCheckIns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchPartnerCheckIns = async () => {
      if (!profile?.partner_id) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('weekly_check_ins')
          .select('*')
          .eq('user_id', profile.partner_id)
          .eq('is_visible_to_partner', true)
          .order('checkin_date', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        setPartnerCheckIns(data || []);
      } catch (error) {
        console.error('Error fetching partner check-ins:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPartnerCheckIns();
  }, [profile]);
  
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }
  
  if (!profile?.partner_id) {
    return (
      <div className="text-center p-8 bg-muted/30 rounded-lg">
        <h3 className="font-medium mb-2">No partner connected</h3>
        <p className="text-sm text-muted-foreground">
          Connect with your partner to see their shared check-ins.
        </p>
      </div>
    );
  }
  
  if (partnerCheckIns.length === 0) {
    return (
      <div className="text-center p-8 bg-muted/30 rounded-lg">
        <h3 className="font-medium mb-2">No shared check-ins</h3>
        <p className="text-sm text-muted-foreground">
          Your partner hasn't shared any check-ins with you yet.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {partnerCheckIns.map((checkIn) => (
        <Card key={checkIn.id} className="bg-white hover:bg-gray-50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center justify-between">
              <span>{format(new Date(checkIn.checkin_date), 'MMMM d, yyyy')}</span>
              {getMoodIcon(checkIn.mood)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-muted/30 p-2 rounded-md">
                <p className="text-xs text-muted-foreground">Connection</p>
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-4 h-1 rounded-full mr-0.5 ${
                        i < checkIn.connection_level ? 'bg-love-500' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                  <span className="ml-1 text-sm">{checkIn.connection_level}/5</span>
                </div>
              </div>
              
              <div className="bg-muted/30 p-2 rounded-md">
                <p className="text-xs text-muted-foreground">Communication</p>
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-4 h-1 rounded-full mr-0.5 ${
                        i < checkIn.communication_rating ? 'bg-harmony-500' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                  <span className="ml-1 text-sm">{checkIn.communication_rating}/5</span>
                </div>
              </div>
            </div>
            
            {checkIn.reflection_note && (
              <div className="mt-2">
                <p className="text-sm italic">"{checkIn.reflection_note}"</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Add missing imports
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getMoodIcon } from '@/components/check-ins/MoodOptions';
import { format } from 'date-fns';

export default WeeklyCheckInsSection;
