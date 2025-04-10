
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
    
    // First, check if the token exists at all
    const { data: allInvites, error: checkError } = await supabase
      .from('partner_invites')
      .select('*')
      .eq('token', token);
      
    if (checkError) {
      console.error('Error checking for invite:', checkError);
      return { data: null, error: checkError };
    }
    
    // Debug info about all found invites
    console.log(`Found ${allInvites?.length || 0} total invites with this token`);
    if (allInvites && allInvites.length > 0) {
      allInvites.forEach(invite => {
        console.log('Invite details:', {
          id: invite.id,
          token: invite.token,
          is_accepted: invite.is_accepted,
          expires_at: invite.expires_at,
          current_time: now
        });
      });
    } else {
      console.log('No invites found with this token in the database');
      return { data: null, error: new Error('Invitation not found') };
    }
    
    // Get the invitation data (must be valid and not expired)
    const { data: invite, error: inviteError } = await supabase
      .from('partner_invites')
      .select('*')
      .eq('token', token)
      .eq('is_accepted', false)
      .gt('expires_at', now)
      .maybeSingle();
      
    if (inviteError) {
      console.error('Error fetching valid invitation:', inviteError);
      return { data: null, error: inviteError };
    }
    
    // If no valid invite is found
    if (!invite) {
      console.log('No valid invitation found for token:', token);
      
      // Check why it's invalid - already accepted or expired
      const { data: acceptedInvite } = await supabase
        .from('partner_invites')
        .select('*')
        .eq('token', token)
        .eq('is_accepted', true)
        .maybeSingle();
        
      if (acceptedInvite) {
        console.log('Invitation was already accepted');
        return { data: null, error: new Error('This invitation has already been accepted') };
      }
      
      const { data: expiredInvite } = await supabase
        .from('partner_invites')
        .select('*')
        .eq('token', token)
        .lte('expires_at', now)
        .maybeSingle();
        
      if (expiredInvite) {
        console.log('Invitation has expired');
        return { data: null, error: new Error('This invitation has expired') };
      }
      
      return { data: null, error: new Error('Invitation not found, expired, or already accepted') };
    }

    // Check if inviter still exists
    console.log('Checking if inviter still exists:', invite.inviter_id);
    const { data: inviterProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, full_name')
      .eq('id', invite.inviter_id)
      .maybeSingle();
      
    if (profileError) {
      console.error('Error checking inviter profile:', profileError);
      return { data: null, error: profileError };
    }
    
    if (!inviterProfile) {
      console.log('Inviter profile not found for ID:', invite.inviter_id);
      
      // Check if the user exists at all in auth.users
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(invite.inviter_id);
      
      if (authError) {
        console.error('Error checking inviter in auth system:', authError);
      }
      
      console.log('Auth user check result:', authUser ? 'User exists' : 'User does not exist');
      
      return { 
        data: null, 
        error: new Error('The invitation is no longer valid because the inviter no longer has an account') 
      };
    }
    
    console.log('Inviter profile found:', inviterProfile);
    
    // Enhance the invite with the inviter's name
    const enhancedInvite = await enhanceInviteWithInviterName(invite as PartnerInvite);
    return { data: enhancedInvite, error: null };
  } catch (error) {
    console.error('Error in getInvitationByToken:', error);
    return { data: null, error };
  }
};
