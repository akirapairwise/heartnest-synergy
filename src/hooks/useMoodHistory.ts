
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
      
      // First try to get moods from daily_moods (newer format)
      const { data: dailyMoodsData, error: dailyMoodsError } = await supabase
        .from('daily_moods')
        .select('id, mood_date, mood_value, note')
        .eq('user_id', user.id)
        .order('mood_date', { ascending: false })
        .limit(10);
        
      if (dailyMoodsError) {
        console.error('Error fetching daily moods:', dailyMoodsError);
        throw dailyMoodsError;
      }
      
      if (dailyMoodsData && dailyMoodsData.length > 0) {
        // Map daily_moods format to MoodEntry format
        const formattedData = dailyMoodsData.map(entry => ({
          id: entry.id,
          date: entry.mood_date,
          mood: entry.mood_value, // This is already a number between 1-5
          note: entry.note || ''
        }));
        
        setMoodHistory(formattedData);
      } else {
        // Fallback to legacy check_ins table if no data in daily_moods
        const { data: checkInsData, error: checkInsError } = await supabase
          .from('check_ins')
          .select('id, timestamp, mood, reflection')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false })
          .limit(10);
          
        if (checkInsError) throw checkInsError;
        
        // Parse mood value from check_ins format (e.g., "3_neutral")
        const formattedData = (checkInsData || []).map(entry => {
          // Extract just the first digit from the mood string and convert to number
          const moodValue = parseInt(entry.mood.charAt(0));
          
          return {
            id: entry.id,
            date: entry.timestamp,
            mood: isNaN(moodValue) ? 3 : moodValue, // Default to 3 if parsing fails
            note: entry.reflection || ''
          };
        });
        
        setMoodHistory(formattedData);
      }
    } catch (error) {
      console.error('Error fetching mood history:', error);
      toast.error('Failed to load mood history');
      setMoodHistory([]); // Reset to empty array on error
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
