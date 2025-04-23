
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

type SummaryState =
  | { status: 'idle', summary: null, error: null }
  | { status: 'loading', summary: null, error: null }
  | { status: 'success', summary: string, error: null }
  | { status: 'error', summary: null, error: string };

// Helper to fetch data needed for the summary (mock - replace w/ real data as needed)
const fetchCheckInData = async (userId: string) => {
  // TODO: Replace with real Supabase queries for moods, goals & events
  // For now, simulated fake/mocked mood logs, goals, and shared moments:
  // In production, fetch from the correct tables in Supabase for weekly range!
  return {
    mood_logs: [
      "Monday: Happy (checked-in after a good talk)",
      "Wednesday: Stressed (work pressure)", 
      "Friday: Content (enjoyed movie night together)"
    ],
    goal_updates: [
      "Marked 'Plan Date Night' as completed.",
      "Checked progress on 'Improve Communication' goal."
    ],
    shared_moments: [
      "Had a minor disagreement, resolved it calmly.",
      "Celebrated a small win at work together."
    ]
  };
};

export const useWeeklyAISummary = () => {
  const { user, session } = useAuth();
  const [state, setState] = useState<SummaryState>({ status: 'idle', summary: null, error: null });

  const fetchSummary = async () => {
    if (!user || !session?.access_token) {
      setState({ status: 'error', summary: null, error: 'Not authenticated.' });
      return;
    }

    setState({ status: 'loading', summary: null, error: null });
    try {
      // Optionally cache within a week: check localStorage for summary+timestamp
      const cacheKey = `weeklyAIInsight:${user.id}`;
      const cacheTimestamp = localStorage.getItem(`${cacheKey}:ts`);
      const cacheValue = localStorage.getItem(cacheKey);
      if (
        cacheValue &&
        cacheTimestamp &&
        Date.now() - Number(cacheTimestamp) < 24 * 60 * 60 * 1000
      ) {
        setState({ status: 'success', summary: cacheValue, error: null });
        return;
      }

      // 1. Collect data (mocked; replace with real data logic for real launch)
      const data = await fetchCheckInData(user.id);

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
        setState({ status: 'error', summary: null, error: json.error || 'AI summary unavailable' });
        return;
      }

      // Store in cache
      localStorage.setItem(cacheKey, json.summary);
      localStorage.setItem(`${cacheKey}:ts`, Date.now().toString());
      setState({ status: 'success', summary: json.summary, error: null });
    } catch (error: any) {
      setState({ status: 'error', summary: null, error: error.message || 'Error talking to OpenAI.' });
    }
  };

  return {
    status: state.status,
    summary: state.summary,
    error: state.error,
    fetchSummary,
  };
};
