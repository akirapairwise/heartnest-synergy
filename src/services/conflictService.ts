
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
  try {
    // First, fetch the conflict to get both statements
    const { data: conflict, error: fetchError } = await supabase
      .from('conflicts')
      .select('*')
      .eq('id', conflictId)
      .single();
    
    if (fetchError) throw fetchError;
    
    if (!conflict || !conflict.initiator_statement || !conflict.responder_statement) {
      throw new Error('Conflict not found or missing statements');
    }
    
    // Call the Edge Function to generate the AI resolution
    const { data, error } = await supabase.functions.invoke('resolve-conflict', {
      body: {
        conflict_id: conflict.id,
        initiator_statement: conflict.initiator_statement,
        responder_statement: conflict.responder_statement
      }
    });
    
    if (error) {
      console.error('Error calling resolve-conflict:', error);
      throw error;
    }
    
    if (!data || !data.success) {
      throw new Error(data?.error || 'Failed to generate AI resolution');
    }
    
    const { summary, reflection, plan } = data.data;
    
    // Update the conflict with the AI resolution
    const { error: updateError } = await supabase
      .from('conflicts')
      .update({
        ai_summary: summary,
        ai_reflection: reflection,
        ai_resolution_plan: plan
      })
      .eq('id', conflictId);
    
    if (updateError) throw updateError;
  } catch (error) {
    console.error('Error in generateAIResolution:', error);
    throw error;
  }
};
