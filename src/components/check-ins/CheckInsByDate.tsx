
import React, { useState, useEffect } from 'react';
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { CheckIn } from '@/types/check-ins';
import { getMoodIcon } from './MoodOptions';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import CheckInCalendar from './CheckInCalendar';

const CheckInsByDate: React.FC = () => {
  const { user } = useAuth();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckIn | null>(null);
  
  // Fetch all check-ins for the user
  useEffect(() => {
    const fetchCheckIns = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('check_ins')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        setCheckIns(data as CheckIn[]);
      } catch (error) {
        console.error('Error fetching check-ins:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCheckIns();
  }, [user]);
  
  // Filter check-ins for the selected date
  const checkInsForSelectedDate = selectedDate 
    ? checkIns.filter(checkIn => {
        const checkInDate = new Date(checkIn.timestamp);
        return (
          checkInDate.getDate() === selectedDate.getDate() &&
          checkInDate.getMonth() === selectedDate.getMonth() &&
          checkInDate.getFullYear() === selectedDate.getFullYear()
        );
      })
    : [];

  const handleViewCheckIn = (checkIn: CheckIn) => {
    setSelectedCheckIn(checkIn);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <CheckInCalendar 
        checkIns={checkIns}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />
      
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedDate ? (
              <>Check-ins for {format(selectedDate, "MMMM d, yyyy")}</>
            ) : (
              <>Select a date</>
            )}
          </CardTitle>
          <CardDescription>
            {checkInsForSelectedDate.length === 0 ? (
              selectedDate ? 'No check-ins for this date' : 'Select a date to see check-ins'
            ) : (
              `${checkInsForSelectedDate.length} check-in(s) found`
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {checkInsForSelectedDate.length > 0 ? (
            <div className="space-y-4">
              {checkInsForSelectedDate.map((checkIn) => (
                <div 
                  key={checkIn.id} 
                  className="border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleViewCheckIn(checkIn)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getMoodIcon(checkIn.mood)}
                      <div>
                        <div className="font-medium capitalize">{checkIn.mood}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(checkIn.timestamp), "h:mm a")}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      {checkIn.satisfaction_rating}/10
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mb-2 opacity-20" />
              <p>No check-ins found for this date</p>
              {selectedDate && new Date(selectedDate).toDateString() === new Date().toDateString() && (
                <Button 
                  variant="link" 
                  className="mt-2" 
                  onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Create your first check-in
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckInsByDate;
