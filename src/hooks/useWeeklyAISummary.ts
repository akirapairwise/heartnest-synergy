import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

type SummaryState =
  | { status: 'idle', summary: null, error: null }
  | { status: 'loading', summary: null, error: null }
  | { status: 'success', summary: string, error: null }
  | { status: 'error', summary: null, error: string }
  | { status: 'insufficient_data', summary: null, error: null }; // Added new state type

// Helper to fetch all the data needed for the summary
const fetchCheckInData = async (userId: string) => {
  // Get the start of the current week (Monday)
  const today = new Date();
  const dayOfWeek = today.getDay();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  
  const startDateString = startDate.toISOString().split('T')[0];
  
  try {
    // 1. Fetch mood logs for the week
    const { data: moodData, error: moodError } = await supabase
      .from('daily_moods')
      .select('mood_date, mood_value, note')
      .eq('user_id', userId)
      .gte('mood_date', startDateString)
      .order('mood_date', { ascending: true });
      
    if (moodError) throw moodError;
    
    // 2. Fetch goal updates
    const { data: goalData, error: goalError } = await supabase
      .from('goals')
      .select('title, status, updated_at')
      .eq('owner_id', userId)
      .gte('updated_at', new Date(startDateString).toISOString())
      .order('updated_at', { ascending: true });
      
    if (goalError) throw goalError;
    
    // 3. Fetch weekly check-ins
    const { data: checkInData, error: checkInError } = await supabase
      .from('weekly_check_ins')
      .select('*')
      .eq('user_id', userId)
      .gte('checkin_date', startDateString)
      .order('checkin_date', { ascending: true });
      
    if (checkInError) throw checkInError;
    
    // 4. Fetch conflicts/resolutions
    const { data: conflictData, error: conflictError } = await supabase
      .from('conflicts')
      .select('topic, created_at, resolved_at')
      .or(`initiator_id.eq.${userId},responder_id.eq.${userId}`)
      .gte('created_at', new Date(startDateString).toISOString())
      .order('created_at', { ascending: true });
      
    if (conflictError) throw conflictError;
    
    // 5. Fetch user profile for relationship goals and context
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('relationship_status, relationship_goals, areas_to_improve, shared_goals')
      .eq('id', userId)
      .single();
      
    if (profileError) throw profileError;
    
    // Format the data for the AI
    const mood_logs = moodData?.map(mood => 
      `${mood.mood_date}: Mood level ${mood.mood_value}/5${mood.note ? ` - Note: "${mood.note}"` : ''}`
    ) || [];
    
    const goal_updates = goalData?.map(goal => 
      `${new Date(goal.updated_at).toLocaleDateString()}: ${goal.title} - Status: ${goal.status}`
    ) || [];
    
    const shared_moments = [];
    
    // Add check-ins to shared moments
    if (checkInData?.length) {
      checkInData.forEach(checkIn => {
        shared_moments.push(
          `Weekly check-in on ${checkIn.checkin_date}: Connection rating ${checkIn.connection_level}/5, Communication rating ${checkIn.communication_rating}/5${checkIn.reflection_note ? ` - Reflection: "${checkIn.reflection_note}"` : ''}`
        );
      });
    }
    
    // Add conflicts to shared moments
    if (conflictData?.length) {
      conflictData.forEach(conflict => {
        shared_moments.push(
          `Conflict about "${conflict.topic}" on ${new Date(conflict.created_at).toLocaleDateString()}${conflict.resolved_at ? ` - Resolved on ${new Date(conflict.resolved_at).toLocaleDateString()}` : ' - Unresolved'}`
        );
      });
    }
    
    // Include relationship context
    const relationship_context = {
      status: profileData?.relationship_status || 'Not specified',
      goals: profileData?.relationship_goals || 'Not specified',
      areas_to_improve: Array.isArray(profileData?.areas_to_improve) 
        ? profileData?.areas_to_improve.join(', ') 
        : 'Not specified',
      shared_goals: Array.isArray(profileData?.shared_goals) 
        ? profileData?.shared_goals.join(', ') 
        : 'Not specified'
    };
    
    return {
      mood_logs,
      goal_updates,
      shared_moments,
      relationship_context
    };
  } catch (error) {
    console.error('Error fetching check-in data:', error);
    throw error;
  }
};

export const useWeeklyAISummary = () => {
  const { user, session } = useAuth();
  const [state, setState] = useState<SummaryState>({ status: 'idle', summary: null, error: null });

  // Query to fetch summary from cache
  const cachedSummaryQuery = useQuery({
    queryKey: ['weeklyAISummary', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Try to get cached summary from localStorage
      const cacheKey = `weeklyAIInsight:${user.id}`;
      const cacheTimestamp = localStorage.getItem(`${cacheKey}:ts`);
      const cacheValue = localStorage.getItem(cacheKey);
      
      if (
        cacheValue &&
        cacheTimestamp &&
        Date.now() - Number(cacheTimestamp) < 24 * 60 * 60 * 1000
      ) {
        return cacheValue;
      }
      
      throw new Error('No cached summary');
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
      
      // Check if there's sufficient data before calling the edge function
      const hasData = data.mood_logs.length > 0 || data.goal_updates.length > 0 || data.shared_moments.length > 0;
      
      if (!hasData) {
        // Instead of throwing an error, return a special value to indicate insufficient data
        return { insufficient_data: true };
      }

      // 2. Call Edge Function
      const resp = await fetch(
        `https://itmegnklwvtitwknyvkm.functions.supabase.co/weekly-ai-summary`,
        {
          method: 'POST',
          headers: {
            "authorization": `Bearer ${session.access_token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data),
        }
      );
      const json = await resp.json();
      if (!resp.ok || !json.summary) {
        throw new Error(json.error || 'AI summary unavailable');
      }

      // Store in cache
      const cacheKey = `weeklyAIInsight:${user.id}`;
      localStorage.setItem(cacheKey, json.summary);
      localStorage.setItem(`${cacheKey}:ts`, Date.now().toString());
      return json.summary;
    }
  });

  // Set the state based on query/mutation status
  useEffect(() => {
    if (cachedSummaryQuery.isSuccess) {
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
      if (cachedSummaryQuery.isSuccess) {
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
