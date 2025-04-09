
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';
import { MoodEntry } from '@/types/check-ins';
import MoodTracker from '@/components/moods/MoodTracker';
import MoodHistory from '@/components/moods/MoodHistory';
import { toast } from 'sonner';

const MoodsPage = () => {
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
  
  const handleMoodSaved = () => {
    fetchMoodHistory();
  };
  
  return (
    <div className="animate-fade-in space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Mood Tracker</h1>
        <p className="text-muted-foreground">Track how you feel about your relationship over time</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MoodTracker onMoodSaved={handleMoodSaved} />
        </div>
        
        <div>
          <MoodHistory 
            moodHistory={moodHistory}
            isLoading={isFetchingHistory}
          />
        </div>
      </div>
    </div>
  );
};

export default MoodsPage;
