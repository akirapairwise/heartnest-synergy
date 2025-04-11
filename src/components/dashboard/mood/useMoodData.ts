
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { MoodEntry } from '@/types/check-ins';
import { useAuth } from '@/contexts/AuthContext';

interface PartnerMood {
  id: string;
  date: string;
  mood: number;
  note: string | null;
  is_visible_to_partner: boolean;
}

interface MoodDataReturn {
  userMood: MoodEntry | null;
  partnerMood: PartnerMood | null;
  partnerProfile: any;
  isLoading: boolean;
  error: string | null;
  fetchLatestMoods: () => Promise<void>;
}

export const useMoodData = (): MoodDataReturn => {
  const [userMood, setUserMood] = useState<MoodEntry | null>(null);
  const [partnerMood, setPartnerMood] = useState<PartnerMood | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user, profile } = useAuth();
  
  useEffect(() => {
    if (user) {
      fetchLatestMoods();
      if (profile?.partner_id) {
        fetchPartnerProfile();
      }
    } else {
      setIsLoading(false);
    }
  }, [user, profile?.partner_id]);
  
  const fetchPartnerProfile = async () => {
    if (!profile?.partner_id) return;
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', profile.partner_id)
        .single();
        
      if (error) {
        console.error('Error fetching partner profile:', error);
        return;
      }
      
      if (data) {
        setPartnerProfile(data);
      }
    } catch (error) {
      console.error('Error fetching partner profile:', error);
    }
  };
  
  const fetchLatestMoods = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch user's latest mood from daily_moods
      const { data: userDailyMood, error: userDailyMoodError } = await supabase
        .from('daily_moods')
        .select('id, mood_date, mood_value, note')
        .eq('user_id', user?.id)
        .eq('mood_date', today)
        .maybeSingle();
      
      if (userDailyMoodError) {
        console.error('Error fetching user daily mood:', userDailyMoodError);
      }
      
      // If found in daily_moods, use that
      if (userDailyMood) {
        setUserMood({
          id: userDailyMood.id,
          date: userDailyMood.mood_date,
          mood: userDailyMood.mood_value,
          note: userDailyMood.note
        });
      } else {
        // Fallback to check_ins
        const { data: userData, error: userError } = await supabase
          .from('check_ins')
          .select('id, timestamp, mood, reflection')
          .eq('user_id', user?.id)
          .order('timestamp', { ascending: false })
          .limit(1);
          
        if (userError) {
          console.error('Error fetching user mood:', userError);
          setError('Failed to load your mood data');
          return;
        }
        
        if (userData && userData.length > 0) {
          setUserMood({
            id: userData[0].id,
            date: userData[0].timestamp,
            mood: parseInt(userData[0].mood.charAt(0)),
            note: userData[0].reflection
          });
        }
      }
      
      // Fetch partner's mood if partner exists
      if (profile?.partner_id) {
        // First try daily_moods with visibility check
        const { data: partnerDailyMood, error: partnerDailyMoodError } = await supabase
          .from('daily_moods')
          .select('id, mood_date, mood_value, note, is_visible_to_partner')
          .eq('user_id', profile.partner_id)
          .eq('mood_date', today)
          .maybeSingle();
          
        if (partnerDailyMoodError) {
          console.error('Error fetching partner daily mood:', partnerDailyMoodError);
        }
        
        if (partnerDailyMood) {
          setPartnerMood({
            id: partnerDailyMood.id,
            date: partnerDailyMood.mood_date,
            mood: partnerDailyMood.mood_value,
            note: partnerDailyMood.note,
            is_visible_to_partner: partnerDailyMood.is_visible_to_partner !== false
          });
        } else {
          // Fallback to check_ins (assuming all check_ins are visible)
          const { data: partnerData, error: partnerError } = await supabase
            .from('check_ins')
            .select('id, timestamp, mood, reflection')
            .eq('user_id', profile.partner_id)
            .order('timestamp', { ascending: false })
            .limit(1);
            
          if (partnerError) {
            console.error('Error fetching partner mood:', partnerError);
          }
          
          if (partnerData && partnerData.length > 0) {
            setPartnerMood({
              id: partnerData[0].id,
              date: partnerData[0].timestamp,
              mood: parseInt(partnerData[0].mood.charAt(0)),
              note: partnerData[0].reflection,
              is_visible_to_partner: true // Legacy entries assumed to be visible
            });
          }
        }
      } else {
        // Reset partner mood if no partner
        setPartnerMood(null);
      }
    } catch (error: any) {
      console.error('Error fetching mood data:', error);
      setError('Failed to load mood data');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    userMood,
    partnerMood,
    partnerProfile,
    isLoading,
    error,
    fetchLatestMoods
  };
};
