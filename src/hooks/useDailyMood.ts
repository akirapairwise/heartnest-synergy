import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MoodEntry } from '@/types/check-ins';
import { toast } from 'sonner';
import { notifyPartnerMoodUpdate } from '@/services/partnerNotificationService';

export const useDailyMood = () => {
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [todaysMood, setTodaysMood] = useState<MoodEntry | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Function to load today's mood entry
  const loadTodaysMood = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      
      const { data, error } = await supabase
        .from('daily_moods')
        .select('*')
        .eq('user_id', user.id)
        .eq('mood_date', today)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
        throw error;
      }
      
      setTodaysMood(data || null);
    } catch (err) {
      console.error('Error loading today\'s mood:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to save or update today's mood
  const saveDailyMood = async (
    moodValue: number, 
    note: string = '', 
    isVisibleToPartner: boolean = true
  ): Promise<boolean> => {
    if (!user) return false;
    
    try {
      setIsLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const timestamp = new Date().toISOString();
      
      // If mood exists for today, update it
      if (todaysMood?.id) {
        const { error } = await supabase
          .from('daily_moods')
          .update({
            mood_value: moodValue,
            note,
            is_visible_to_partner: isVisibleToPartner,
            timestamp
          })
          .eq('id', todaysMood.id);
          
        if (error) throw error;
        
        // Notify partner about the mood update if they have a partner and the mood is shared
        if (profile?.partner_id && isVisibleToPartner) {
          await notifyPartnerMoodUpdate(
            profile.partner_id, 
            getMoodLabel(moodValue),
            isVisibleToPartner
          );
        }
        
        setTodaysMood({
          ...todaysMood,
          mood: moodValue,
          note,
          is_visible_to_partner: isVisibleToPartner,
          timestamp
        });
      } 
      // Otherwise, create a new mood entry for today
      else {
        const newMood = {
          user_id: user.id,
          mood_date: today,
          mood_value: moodValue,
          note,
          is_visible_to_partner: isVisibleToPartner,
          timestamp
        };
        
        const { data, error } = await supabase
          .from('daily_moods')
          .insert(newMood)
          .select()
          .single();
          
        if (error) throw error;
        
        // Notify partner about the new mood if they have a partner and the mood is shared
        if (profile?.partner_id && isVisibleToPartner) {
          await notifyPartnerMoodUpdate(
            profile.partner_id, 
            getMoodLabel(moodValue),
            isVisibleToPartner
          );
        }
        
        setTodaysMood(data);
      }
      
      return true;
    } catch (err) {
      console.error('Error saving mood:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to toggle visibility to partner
  const toggleMoodVisibility = async (): Promise<boolean> => {
    if (!todaysMood || !user) return false;
    
    try {
      setIsLoading(true);
      const newVisibility = !todaysMood.is_visible_to_partner;
      
      const { error } = await supabase
        .from('daily_moods')
        .update({ is_visible_to_partner: newVisibility })
        .eq('id', todaysMood.id);
        
      if (error) throw error;
      
      // If changing from private to visible, notify partner
      if (newVisibility && profile?.partner_id) {
        await notifyPartnerMoodUpdate(
          profile.partner_id, 
          getMoodLabel(todaysMood.mood),
          newVisibility
        );
      }
      
      setTodaysMood({
        ...todaysMood,
        is_visible_to_partner: newVisibility
      });
      
      return true;
    } catch (err) {
      console.error('Error toggling mood visibility:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to convert mood value to text label
  const getMoodLabel = (moodValue: number): string => {
    switch (moodValue) {
      case 1: return 'Very Sad';
      case 2: return 'Sad';
      case 3: return 'Neutral';
      case 4: return 'Happy';
      case 5: return 'Very Happy';
      default: return 'Unknown';
    }
  };
  
  // Load today's mood on component mount or user change
  useEffect(() => {
    if (user) {
      loadTodaysMood();
    } else {
      setTodaysMood(null);
      setIsLoading(false);
    }
  }, [user]);
  
  return {
    todaysMood,
    isLoading,
    error,
    saveDailyMood,
    toggleMoodVisibility,
    refreshMood: loadTodaysMood
  };
};

export default useDailyMood;
