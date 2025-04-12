
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { getMoodIcon } from '@/components/check-ins/MoodOptions';
import { Skeleton } from '@/components/ui/skeleton';

interface CheckIn {
  id: string;
  mood: string;
  connection_level: number;
  communication_rating: number;
  reflection_note: string | null;
  checkin_date: string;
  is_visible_to_partner: boolean;
}

const RecentWeeklyCheckIns = () => {
  const { user } = useAuth();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCheckIns = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('weekly_check_ins')
          .select('*')
          .eq('user_id', user.id)
          .order('checkin_date', { ascending: false })
          .limit(5);
          
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
  
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }
  
  if (checkIns.length === 0) {
    return (
      <div className="text-center p-8 bg-muted/30 rounded-lg">
        <h3 className="font-medium mb-2">No check-ins yet</h3>
        <p className="text-sm text-muted-foreground">
          Complete your first weekly check-in to start tracking your relationship progress.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Recent Check-ins</h2>
      
      {checkIns.map((checkIn) => (
        <Card key={checkIn.id} className="bg-white hover:bg-gray-50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center justify-between">
              <span>{format(new Date(checkIn.checkin_date), 'MMMM d, yyyy')}</span>
              <div className="flex items-center space-x-2">
                {getMoodIcon(checkIn.mood)}
                {checkIn.is_visible_to_partner && (
                  <span className="text-xs bg-harmony-100 text-harmony-700 px-2 py-0.5 rounded-full">
                    Shared
                  </span>
                )}
              </div>
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

export default RecentWeeklyCheckIns;
