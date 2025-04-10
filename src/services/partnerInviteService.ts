
import { supabase } from "@/integrations/supabase/client";
import { PartnerInvite } from "@/services/partners/types";
import { enhanceInviteWithInviterName } from "./partners/utils";

/**
 * Fetches invitation by token
 */
export const getInvitationByToken = async (token: string) => {
  try {
    const now = new Date().toISOString();
    
    console.log('Fetching invitation by token:', token);
    
    // Get the invitation data (must be valid and not expired)
    // Use maybeSingle instead of single to avoid the "multiple or no rows" error
    const { data: invite, error: inviteError } = await supabase
      .from('partner_invites')
      .select('*')
      .eq('token', token)
      .eq('is_accepted', false)
      .gt('expires_at', now)
      .maybeSingle();
      
    if (inviteError) {
      console.error('Error fetching invitation:', inviteError);
      return { data: null, error: inviteError };
    }
    
    // If no invite is found
    if (!invite) {
      console.log('No valid invitation found for token:', token);
      return { data: null, error: new Error('Invitation not found, expired, or already accepted') };
    }

    // Check if inviter still exists
    // First try to get the actual auth user to make sure they still exist
    const { data: inviterAuth, error: authError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', invite.inviter_id)
      .maybeSingle();
      
    if (authError) {
      console.error('Error checking inviter auth:', authError);
      // Continue with the process, we'll check this result below
    }
    
    if (!inviterAuth) {
      console.log('Inviter no longer has an account:', invite.inviter_id);
      return { 
        data: null, 
        error: new Error('The invitation is no longer valid because the inviter no longer has an account') 
      };
    }
    
    // Enhance the invite with the inviter's name
    const enhancedInvite = await enhanceInviteWithInviterName(invite as PartnerInvite);
    return { data: enhancedInvite, error: null };
  } catch (error) {
    console.error('Error in getInvitationByToken:', error);
    return { data: null, error };
  }
};
