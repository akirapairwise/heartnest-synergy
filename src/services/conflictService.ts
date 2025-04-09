
import { supabase } from '@/integrations/supabase/client';
import { Conflict, ConflictStatus } from '@/types/conflicts';

export const fetchUserConflicts = async (userId: string): Promise<Conflict[]> => {
  // Cast the response data to Conflict[] type
  const { data, error } = await supabase
    .from('conflicts')
    .select('*')
    .or(`initiator_id.eq.${userId},responder_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return (data || []) as unknown as Conflict[];
};

export const getConflictStatus = (conflict: Conflict, userId: string): ConflictStatus => {
  if (conflict.resolved_at) {
    return 'resolved';
  }
  
  if (!conflict.responder_statement) {
    // If the user is the responder and there's no response yet
    if (conflict.responder_id === userId) {
      return 'pending_response';
    }
    // If the user is the initiator waiting for partner response
    return 'pending_response';
  }
  
  if (!conflict.ai_resolution_plan) {
    return 'pending_ai';
  }
  
  return 'active';
};

export const generateAIResolution = async (conflictId: string): Promise<void> => {
  // This would connect to an edge function or external AI service
  // For now, we'll just update with mock data
  
  const mockAiSummary = "Both partners have different perspectives on how household chores should be allocated.";
  const mockAiReflection = "This conflict stems from different expectations about fairness and responsibility.";
  const mockAiPlan = "1. Create a shared chore schedule\n2. Define what 'clean' means to each person\n3. Schedule a weekly check-in about household management";
  
  // Cast the update to any to bypass TypeScript's strict checking
  const { error } = await supabase
    .from('conflicts')
    .update({
      ai_summary: mockAiSummary,
      ai_reflection: mockAiReflection,
      ai_resolution_plan: mockAiPlan
    } as any)
    .eq('id', conflictId);
  
  if (error) throw error;
};
