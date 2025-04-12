
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useWeeklyAISummary = () => {
  const { user, session } = useAuth();
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Initial load - check for cached insight
  useEffect(() => {
    const cachedInsight = localStorage.getItem('weeklyAIInsight');
    const cachedTimestamp = localStorage.getItem('weeklyAIInsightTimestamp');
    
    // Only use cache if it's less than 24 hours old
    if (cachedInsight && cachedTimestamp && 
        (Date.now() - Number(cachedTimestamp) < 24 * 60 * 60 * 1000)) {
      setInsight(cachedInsight);
    }
  }, []);

  const fetchWeeklyAISummary = async () => {
    if (!user || !session?.access_token) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://itmegnklwvtitwknyvkm.functions.supabase.co/weekly-ai-summary`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            user_id: user.id
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      setInsight(data.insight);
      
      // Cache the insight
      localStorage.setItem('weeklyAIInsight', data.insight);
      localStorage.setItem('weeklyAIInsightTimestamp', Date.now().toString());
    } catch (err: any) {
      console.error('Error fetching weekly AI summary:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    insight,
    isLoading,
    error,
    fetchWeeklyAISummary
  };
};
