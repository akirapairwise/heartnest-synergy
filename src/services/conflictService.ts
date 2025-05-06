import { supabase } from '@/integrations/supabase/client';
import { Conflict, ConflictStatus } from '@/types/conflicts';

export const fetchUserConflicts = async (userId: string, limit: number = 3, offset: number = 0): Promise<{conflicts: Conflict[], total: number}> => {
  // Get total count first
  const countQuery = await supabase
    .from('conflicts')
    .select('id', { count: 'exact' })
    .or(`initiator_id.eq.${userId},responder_id.eq.${userId}`);
    
  const total = countQuery.count || 0;
  
  // Then fetch the paginated data
  const { data, error } = await supabase
    .from('conflicts')
    .select('*')
    .or(`initiator_id.eq.${userId},responder_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) throw error;
  return { 
    conflicts: (data || []) as unknown as Conflict[], 
    total
  };
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
    // First, fetch the conflict details without joins
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
    
    // Use the supabase JWT as the authorization token
    const { data: authData } = await supabase.auth.getSession();
    const authToken = authData?.session?.access_token;
    
    if (!authToken) {
      console.error('User not authenticated');
      throw new Error('User not authenticated');
    }
    
    console.log('Making request to edge function with conflict ID:', conflictId);
    
    // Fetch user names separately with individual queries to avoid join issues
    const { data: initiatorData } = await supabase
      .from('user_profiles')
      .select('full_name')
      .eq('id', conflict.initiator_id)
      .single();
      
    const { data: responderData } = await supabase
      .from('user_profiles')
      .select('full_name')
      .eq('id', conflict.responder_id)
      .single();
    
    // Use safe defaults if user data is not found
    const initiatorName = initiatorData?.full_name || "Initiator";
    const responderName = responderData?.full_name || "Responder";
    
    // Direct API call to the resolve-conflict edge function
    const response = await fetch('https://itmegnklwvtitwknyvkm.functions.supabase.co/resolve-conflict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        conflict_id: conflict.id,
        initiator_statement: conflict.initiator_statement,
        responder_statement: conflict.responder_statement,
        initiator_name: initiatorName,
        responder_name: responderName,
        initiator_id: conflict.initiator_id
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
    
    // Store the AI response directly as JSON string to preserve structure
    const aiResolutionPlan = JSON.stringify(data.data);
    
    // Update the conflict with the AI resolution plan
    const { error: updateError } = await supabase
      .from('conflicts')
      .update({
        ai_resolution_plan: aiResolutionPlan
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
