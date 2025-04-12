
import React, { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckIn } from '@/types/check-ins';
import CheckInModal from './CheckInModal';
import CheckInCalendar from './CheckInCalendar';

const CheckInsByDate = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckIn | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    const fetchCheckIns = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const selectedDateString = format(selectedDate, 'yyyy-MM-dd');
        
        const { data, error } = await supabase
          .from('check_ins')
          .select('*')
          .eq('user_id', user.id)
          .gte('timestamp', `${selectedDateString}T00:00:00`)
          .lt('timestamp', `${selectedDateString}T23:59:59`)
          .order('timestamp', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        setCheckIns(data || []);
      } catch (error) {
        console.error('Error fetching check-ins by date:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCheckIns();
  }, [user, selectedDate]);
  
  const handleCheckInClick = (checkIn: CheckIn) => {
    setSelectedCheckIn(checkIn);
    setIsModalOpen(true);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/2">
          <Card>
            <CardContent className="pt-6">
              <CheckInCalendar 
                selectedDate={selectedDate} 
                onDateChange={setSelectedDate}
                checkIns={checkIns}
              />
            </CardContent>
          </Card>
        </div>
        
        <div className="md:w-1/2">
          <h3 className="text-lg font-medium mb-4">
            Check-ins for {format(selectedDate, 'MMMM d, yyyy')}
          </h3>
          
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : checkIns.length > 0 ? (
            <div className="space-y-4">
              {checkIns.map((checkIn) => (
                <Card 
                  key={checkIn.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleCheckInClick(checkIn)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{checkIn.mood}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(checkIn.timestamp), 'h:mm a')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">Satisfaction: {checkIn.satisfaction_rating}/10</p>
                        {checkIn.reflection && (
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {checkIn.reflection}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-muted/30 p-6 rounded-lg text-center">
              <p>No check-ins recorded for this date</p>
            </div>
          )}
        </div>
      </div>
      
      <CheckInModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        selectedCheckIn={selectedCheckIn}
      />
    </div>
  );
};

export default CheckInsByDate;
