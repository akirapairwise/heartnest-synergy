
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
    
    if (fetchError) {
      console.error('Error fetching conflict:', fetchError);
      throw fetchError;
    }
    
    if (!conflict || !conflict.initiator_statement || !conflict.responder_statement) {
      console.error('Conflict not found or missing statements:', conflict);
      throw new Error('Conflict not found or missing statements');
    }
    
    // Get the service role key
    const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY') || process.env.SERVICE_ROLE_KEY;
    
    if (!serviceRoleKey) {
      console.error('SERVICE_ROLE_KEY is not defined');
      throw new Error('Service role key is not configured');
    }
    
    console.log('Making request to edge function with conflict ID:', conflictId);
    
    // Direct API call to the resolve-conflict edge function with proper headers
    const response = await fetch('https://itmegnklwvtitwknyvkm.functions.supabase.co/resolve-conflict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`
      },
      body: JSON.stringify({
        conflict_id: conflict.id,
        initiator_statement: conflict.initiator_statement,
        responder_statement: conflict.responder_statement
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from resolve-conflict:', errorText, 'Status:', response.status);
      throw new Error(`Failed to generate AI resolution: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Response from edge function:', data);
    
    if (!data || !data.success) {
      console.error('Invalid response format from edge function:', data);
      throw new Error(data?.error || 'Failed to generate AI resolution: Invalid response format');
    }
    
    const { summary, reflection, plan } = data.data;
    
    if (!summary || !reflection || !plan) {
      console.error('Missing data in edge function response:', data);
      throw new Error('Edge function response is missing required fields');
    }
    
    // Update the conflict with the AI resolution
    const { error: updateError } = await supabase
      .from('conflicts')
      .update({
        ai_summary: summary,
        ai_reflection: reflection,
        ai_resolution_plan: plan
      })
      .eq('id', conflictId);
    
    if (updateError) {
      console.error('Error updating conflict with AI resolution:', updateError);
      throw updateError;
    }
    
    console.log('Successfully updated conflict with AI resolution');
  } catch (error) {
    console.error('Error in generateAIResolution:', error);
    throw error;
  }
};
