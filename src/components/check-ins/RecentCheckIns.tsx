
import React, { useState, useEffect } from 'react';
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { CheckIn } from '@/types/check-ins';
import { getMoodIcon } from './MoodOptions';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface RecentCheckInsProps {
  limit?: number;
  checkIns?: CheckIn[];
  onViewCheckIn?: (checkIn: CheckIn) => void;
}

const RecentCheckIns: React.FC<RecentCheckInsProps> = ({ 
  limit = 10,
  checkIns: providedCheckIns,
  onViewCheckIn
}) => {
  const { user } = useAuth();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckIn | null>(null);

  useEffect(() => {
    if (providedCheckIns) {
      setCheckIns(providedCheckIns);
      setLoading(false);
      return;
    }
    
    const fetchCheckIns = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('check_ins')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false })
          .limit(limit);
          
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
  }, [user, limit, providedCheckIns]);

  const handleViewCheckIn = (checkIn: CheckIn) => {
    if (onViewCheckIn) {
      onViewCheckIn(checkIn);
    } else {
      setSelectedCheckIn(checkIn);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="w-full h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
      {checkIns.length > 0 ? (
        checkIns.slice(0, limit).map((checkIn) => (
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
                    {format(new Date(checkIn.timestamp), "MMMM d, yyyy • h:mm a")}
                  </div>
                </div>
              </div>
              <div className="text-sm font-medium">
                {checkIn.satisfaction_rating}/10
              </div>
            </div>
            {checkIn.reflection && (
              <div className="mt-2 pl-8 pr-2 text-sm text-muted-foreground line-clamp-2">
                {checkIn.reflection}
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
          <MessageSquare className="h-12 w-12 mb-2 opacity-20" />
          <p>No check-ins yet</p>
          <Button 
            variant="link" 
            className="mt-2" 
            onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Create your first check-in
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecentCheckIns;
