
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useWeeklyAISummary = () => {
  const { user, session } = useAuth();
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

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
