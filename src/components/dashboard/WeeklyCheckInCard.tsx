
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Heart, ArrowRight } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import WeeklyCheckInForm from '@/components/check-ins/WeeklyCheckInForm';
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { createNotification } from '@/services/notificationsService';

const WeeklyCheckInCard = () => {
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Current week range for comparison
  const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
  const currentWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 }); // Sunday
  
  const fetchLastCheckIn = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('weekly_check_ins')
        .select('*')
        .eq('user_id', user.id)
        .order('checkin_date', { ascending: false })
        .limit(1);
        
      if (error) {
        throw error;
      }
      
      setLastCheckIn(data?.[0] || null);
    } catch (error) {
      console.error('Error fetching last check-in:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchLastCheckIn();
  }, [user]);
  
  const isCheckInCompletedThisWeek = () => {
    if (!lastCheckIn || !lastCheckIn.checkin_date) return false;
    
    const checkInDate = new Date(lastCheckIn.checkin_date);
    return isWithinInterval(checkInDate, {
      start: currentWeekStart,
      end: currentWeekEnd
    });
  };
  
  const completedThisWeek = isCheckInCompletedThisWeek();
  
  const handleCheckInComplete = async () => {
    await fetchLastCheckIn();
    
    // Create success notification
    if (user) {
      createNotification({
        userId: user.id,
        type: 'system_message',
        title: 'Weekly Check-in Complete',
        message: 'Your weekly relationship check-in has been recorded. Great job staying connected!'
      }).catch(error => console.error('Failed to create notification:', error));
    }
  };
  
  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-harmony-500 mr-2" />
              <h3 className="font-medium">Weekly Check-In</h3>
            </div>
          </div>
          
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : completedThisWeek ? (
            <div className="space-y-3">
              <div className="bg-harmony-50 text-harmony-700 p-3 rounded-lg flex items-center">
                <Heart className="h-5 w-5 mr-2 text-harmony-500" />
                <span>Check-in completed for this week!</span>
              </div>
              <p className="text-sm text-muted-foreground">
                You completed your weekly check-in on {" "}
                {format(new Date(lastCheckIn.checkin_date), 'MMMM d, yyyy')}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => setIsFormOpen(true)}
              >
                Update Check-In
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm">
                Share how your week has been and track your relationship's progress.
              </p>
              <Button
                className="w-full bg-gradient-to-r from-love-500 to-harmony-500 text-white"
                onClick={() => setIsFormOpen(true)}
              >
                Complete Weekly Check-In
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <WeeklyCheckInForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onCheckInComplete={handleCheckInComplete}
      />
    </>
  );
};

export default WeeklyCheckInCard;
