
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export type DailyMood = {
  id: string;
  mood_date: string;
  mood_value: number;
  note: string | null;
};

export const useDailyMood = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dailyMood, setDailyMood] = useState<DailyMood | null>(null);
  const { user } = useAuth();
  
  const fetchDailyMood = useCallback(async () => {
    if (!user) {
      console.log("fetchDailyMood: No user, skipping fetch");
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      console.log('Fetching mood for user:', user.id, 'date:', today);
      
      const { data, error } = await supabase
        .from('daily_moods')
        .select('id, mood_date, mood_value, note')
        .eq('user_id', user.id)
        .eq('mood_date', today)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching daily mood:', error);
        throw error;
      }
      
      console.log('Daily mood fetch result:', data);
      setDailyMood(data as DailyMood | null);
    } catch (error) {
      console.error('Error fetching daily mood:', error);
      toast.error('Failed to load mood data');
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  const saveDailyMood = useCallback(async (moodValue: number, note?: string) => {
    if (!user) {
      console.log("saveDailyMood: No user, cannot save mood");
      return { error: new Error('User not authenticated') };
    }
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const moodData = {
        user_id: user.id,
        mood_date: today,
        mood_value: moodValue,
        note: note || null
      };
      
      console.log('Saving mood data:', moodData, 'Existing mood:', dailyMood);
      
      if (dailyMood?.id) {
        // Update existing mood
        const { data, error } = await supabase
          .from('daily_moods')
          .update({
            mood_value: moodValue,
            note: note || null
          })
          .eq('id', dailyMood.id)
          .select('id, mood_date, mood_value, note')
          .single();
          
        if (error) {
          console.error('Error updating mood:', error);
          throw error;
        }
        
        console.log('Updated mood result:', data);
        setDailyMood(data as DailyMood);
        return { data: data as DailyMood, error: null };
      } else {
        // Insert new mood
        const { data, error } = await supabase
          .from('daily_moods')
          .insert(moodData)
          .select('id, mood_date, mood_value, note')
          .single();
          
        if (error) {
          console.error('Error inserting mood:', error);
          throw error;
        }
        
        console.log('Inserted mood result:', data);
        setDailyMood(data as DailyMood);
        return { data: data as DailyMood, error: null };
      }
    } catch (error) {
      console.error('Error saving daily mood:', error);
      toast.error('Failed to save mood data');
      return { error };
    }
  }, [user, dailyMood]);
  
  return {
    dailyMood,
    isLoading,
    fetchDailyMood,
    saveDailyMood
  };
};
