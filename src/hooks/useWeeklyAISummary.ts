
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SummaryState } from './weekly-summary/types';
import { fetchCheckInData } from './weekly-summary/weeklyCheckInDataService';
import { fetchWeeklyAISummary } from './weekly-summary/summaryApiService';
import { getSummaryFromCache, saveSummaryToCache } from './weekly-summary/summaryCache';

export const useWeeklyAISummary = () => {
  const { user, session } = useAuth();
  const [state, setState] = useState<SummaryState>({ status: 'idle', summary: null, error: null });

  // Query to fetch summary from cache
  const cachedSummaryQuery = useQuery({
    queryKey: ['weeklyAISummary', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      return getSummaryFromCache(user.id) ?? null;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    enabled: !!user?.id,
    retry: false
  });

  // Mutation to fetch new summary
  const summaryMutation = useMutation({
    mutationFn: async () => {
      if (!user || !session?.access_token) {
        throw new Error('Not authenticated.');
      }

      // 1. Collect data
      const data = await fetchCheckInData(user.id);
      
      // 2. Call Edge Function
      const result = await fetchWeeklyAISummary(user.id, session.access_token, data);
      
      // 3. Handle the result
      if (typeof result === 'object' && 'insufficient_data' in result) {
        return result; // Return the special value
      }
      
      // 4. Cache the result if it's a string (valid summary)
      saveSummaryToCache(user.id, result as string);
      
      return result;
    }
  });

  // Set the state based on query/mutation status
  useEffect(() => {
    if (cachedSummaryQuery.isSuccess && cachedSummaryQuery.data) {
      setState({ status: 'success', summary: cachedSummaryQuery.data, error: null });
    } else if (summaryMutation.isSuccess) {
      // Check if we got the insufficient_data flag
      if (summaryMutation.data && typeof summaryMutation.data === 'object' && 'insufficient_data' in summaryMutation.data) {
        setState({ status: 'insufficient_data', summary: null, error: null });
      } else {
        setState({ status: 'success', summary: summaryMutation.data as string, error: null });
      }
    } else if (summaryMutation.isPending) {
      setState({ status: 'loading', summary: null, error: null });
    } else if (summaryMutation.isError) {
      // Check if the error message indicates insufficient data
      const errorMsg = summaryMutation.error?.message || '';
      if (errorMsg.includes('Insufficient data')) {
        setState({ status: 'insufficient_data', summary: null, error: null });
      } else {
        setState({ 
          status: 'error', 
          summary: null, 
          error: errorMsg || 'Error talking to OpenAI.'
        });
      }
    }
  }, [
    cachedSummaryQuery.isSuccess, cachedSummaryQuery.data,
    summaryMutation.isPending, summaryMutation.isSuccess, 
    summaryMutation.isError, summaryMutation.data, summaryMutation.error
  ]);

  const fetchSummary = async () => {
    try {
      if (cachedSummaryQuery.isSuccess && cachedSummaryQuery.data) {
        // Already have a cached summary
        return;
      }
      
      summaryMutation.mutate();
    } catch (error) {
      toast.error('Failed to fetch relationship summary');
      console.error(error);
    }
  };

  return {
    status: state.status,
    summary: state.summary,
    error: state.error,
    fetchSummary,
  };
};
