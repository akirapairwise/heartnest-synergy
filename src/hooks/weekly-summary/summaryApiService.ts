
import { WeeklySummaryData } from './types';

export const fetchWeeklyAISummary = async (
  userId: string, 
  accessToken: string, 
  data: WeeklySummaryData
): Promise<string | { insufficient_data: boolean }> => {
  // Check if there's sufficient data before calling the edge function
  const hasData = data.mood_logs.length > 0 || data.goal_updates.length > 0 || data.shared_moments.length > 0;
  
  if (!hasData) {
    // Instead of throwing an error, return a special value to indicate insufficient data
    return { insufficient_data: true };
  }

  // Call Edge Function
  const resp = await fetch(
    `https://itmegnklwvtitwknyvkm.functions.supabase.co/weekly-ai-summary`,
    {
      method: 'POST',
      headers: {
        "authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data),
    }
  );
  
  const json = await resp.json();
  
  if (!resp.ok || !json.summary) {
    throw new Error(json.error || 'AI summary unavailable');
  }

  return json.summary;
};
