
import { supabase } from '@/integrations/supabase/client';
import { PartnerInvite } from '@/services/partners/types';

// Format token consistently (uppercase, no spaces)
export const formatToken = (token: string): string => {
  return token.trim().toUpperCase();
};

// Get an invitation by token with validation
export const getInvitationByToken = async (token: string): Promise<{ data: PartnerInvite | null, error: Error | null }> => {
  try {
    console.log('Fetching invitation by token:', token);
    const formattedToken = formatToken(token);
    
    // Use a direct query without complex joins to avoid policy recursion
    const { data, error } = await supabase
      .from('partner_invites')
      .select(`
        id, 
        inviter_id, 
        token, 
        expires_at, 
        is_accepted, 
        created_at
      `)
      .eq('token', formattedToken)
      .eq('is_accepted', false)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching invitation by token:', error);
      return { data: null, error };
    }
    
    if (!data) {
      console.log('No valid invitation found for token:', formattedToken);
      return { 
        data: null, 
        error: new Error('This invitation is invalid, expired, or has already been used') 
      };
    }
    
    // Fetch inviter's name separately without a join to avoid recursion
    try {
      const { data: inviterProfile } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('id', data.inviter_id)
        .maybeSingle();
        
      // Combine the data without complex joins
      const enrichedInvite = {
        ...data,
        inviter_name: inviterProfile?.full_name || 'Someone'
      };
      
      return { data: enrichedInvite as PartnerInvite, error: null };
    } catch (nameError) {
      console.error('Error fetching inviter name:', nameError);
      // Return invite even without the name
      return { data: data as PartnerInvite, error: null };
    }
  } catch (err) {
    console.error('Unexpected error fetching invitation:', err);
    return { 
      data: null, 
      error: err instanceof Error ? err : new Error('Failed to validate invitation') 
    };
  }
};
