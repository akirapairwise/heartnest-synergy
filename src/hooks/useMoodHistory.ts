
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { MoodEntry } from '@/types/check-ins';
import { useAuth } from '@/contexts/AuthContext';

export const useMoodHistory = () => {
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const { user } = useAuth();
  
  const fetchMoodHistory = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsFetchingHistory(true);
      const { data, error } = await supabase
        .from('check_ins')
        .select('id, timestamp, mood, reflection')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      
      const formattedData = (data || []).map(entry => ({
        id: entry.id,
        date: entry.timestamp,
        mood: parseInt(entry.mood.charAt(0)),
        note: entry.reflection
      }));
      
      setMoodHistory(formattedData);
    } catch (error) {
      console.error('Error fetching mood history:', error);
      toast.error('Failed to load mood history');
    } finally {
      setIsFetchingHistory(false);
    }
  }, [user]);
  
  useEffect(() => {
    if (user) {
      fetchMoodHistory();
    }
  }, [user, fetchMoodHistory]);
  
  return {
    moodHistory,
    isFetchingHistory,
    fetchMoodHistory
  };
};
