
import { supabase } from "@/integrations/supabase/client";
import { OperationResult } from "../types";
import { formatToken } from "@/hooks/partner-invites/utils";
import { handlePartnerConnection, ensureProfileExists } from "./connectionHelpers";

/**
 * Accepts a partner invitation and connects both users
 */
export const acceptInvitation = async (token: string, currentUserId: string): Promise<OperationResult> => {
  try {
    console.log('Starting invitation acceptance process...');
    console.log('Current user ID:', currentUserId);
    console.log('Token:', formatToken(token));
    
    // First ensure the current user's profile exists
    const currentUserProfileExists = await ensureProfileExists(currentUserId);
    if (!currentUserProfileExists) {
      console.error('Failed to ensure current user profile exists');
      return { error: new Error('Could not create or verify your profile. Please try again.') };
    }
    
    // Format token to be consistent
    const formattedToken = formatToken(token);
    
    // First check for partner code in partner_codes table
    const { data: partnerCode, error: partnerCodeError } = await supabase
      .from('partner_codes')
      .select('*')
      .eq('code', formattedToken)
      .eq('is_used', false)
      .or('expires_at.is.null,expires_at.gt.now()')
      .maybeSingle();
      
    if (partnerCodeError) {
      console.error('Error fetching partner code:', partnerCodeError);
      // Continue to check invites, don't return an error yet
    }
      
    if (partnerCode) {
      console.log('Found valid partner code:', partnerCode);
      
      // Check that user isn't connecting to themself
      if (partnerCode.inviter_id === currentUserId) {
        console.error('User tried to accept their own invitation');
        return { error: new Error('You cannot accept your own invitation') };
      }
      
      // Ensure inviter profile exists before proceeding
      const inviterProfileExists = await ensureProfileExists(partnerCode.inviter_id);
      if (!inviterProfileExists) {
        console.error('Failed to ensure inviter profile exists');
        return { error: new Error('Could not create or verify partner profile. Please try again.') };
      }
      
      // Process the partner code connection
      return await handlePartnerConnection(currentUserId, partnerCode.inviter_id, partnerCode.code);
    }
    
    // If no partner code found, check partner_invites
    const { data: invite, error: inviteError } = await supabase
      .from('partner_invites')
      .select('*')
      .eq('token', formattedToken)
      .eq('is_accepted', false)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
      
    if (inviteError) {
      console.error('Failed to query partner_invites:', inviteError);
      // Continue to check invites, don't return an error yet
    }
    
    if (invite) {
      console.log('Found valid partner invite:', invite);
      
      // Check that user isn't inviting themselves
      if (invite.inviter_id === currentUserId) {
        console.error('User tried to accept their own invitation');
        return { error: new Error('You cannot accept your own invitation') };
      }
      
      // Ensure inviter profile exists before proceeding
      const inviterProfileExists = await ensureProfileExists(invite.inviter_id);
      if (!inviterProfileExists) {
        console.error('Failed to ensure inviter profile exists');
        return { error: new Error('Could not create or verify partner profile. Please try again.') };
      }
      
      // Update invitation status
      const { error: updateError } = await supabase
        .from('partner_invites')
        .update({ is_accepted: true })
        .eq('id', invite.id);
        
      if (updateError) {
        console.error('Error updating invitation status:', updateError);
        return { error: new Error('Failed to update invitation status') };
      }
      
      return await handlePartnerConnection(currentUserId, invite.inviter_id);
    }
    
    // No valid invitation or code found
    console.error('No valid invitation or code found for token:', formattedToken);
    return { error: new Error('Invitation not found, expired, or already accepted') };
    
  } catch (error) {
    console.error('Error in acceptInvitation:', error);
    return { error };
  }
};
