
import { supabase } from '@/integrations/supabase/client';
import { WeeklySummaryData } from './types';

// Helper to fetch all the data needed for the summary
export const fetchCheckInData = async (userId: string): Promise<WeeklySummaryData> => {
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
    
    const shared_moments: string[] = [];
    
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
