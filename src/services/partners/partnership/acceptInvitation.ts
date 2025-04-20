
import { supabase } from "@/integrations/supabase/client";
import { OperationResult } from "../types";
import { formatToken } from "@/hooks/partner-invites/utils";
import { handlePartnerConnection, ensureProfileExists } from "./connectionHelpers";

/**
 * Accepts a partner invitation and connects both users
 */
export const acceptInvitation = async (token: string, currentUserId: string): Promise<OperationResult> => {
  if (!currentUserId) {
    console.error('No current user ID provided');
    return { error: new Error('You must be logged in to accept an invitation') };
  }

  if (!token) {
    console.error('No token provided');
    return { error: new Error('Invalid invitation token') };
  }

  try {
    console.log('Starting invitation acceptance process...');
    console.log('Current user ID:', currentUserId);
    
    // Format token to be consistent
    const formattedToken = formatToken(token);
    console.log('Formatted token:', formattedToken);
    
    // Ensure the current user's profile exists
    const profileExists = await ensureProfileExists(currentUserId);
    if (!profileExists) {
      console.error('Failed to ensure user profile exists');
      return { error: new Error('Could not verify your account. Please try logging out and back in.') };
    }
    
    // First verify that the current user exists and check if they already have a partner
    const { data: currentUserCheck, error: currentUserError } = await supabase
      .from('user_profiles')
      .select('id, partner_id')
      .eq('id', currentUserId)
      .maybeSingle();
      
    if (currentUserError) {
      console.error('Error verifying current user:', currentUserError);
      return { error: new Error('Could not verify your account. Please try again.') };
    }
    
    // Check if current user already has a partner
    if (currentUserCheck?.partner_id) {
      console.error('Current user already has a partner:', currentUserCheck.partner_id);
      return { error: new Error('You already have a partner. Unlink your current partner before accepting a new invitation.') };
    }
    
    // First check for partner code in partner_codes table
    console.log('Checking for partner code in partner_codes table...');
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
      
      // Ensure inviter profile exists before attempting connection
      const inviterProfileExists = await ensureProfileExists(partnerCode.inviter_id);
      if (!inviterProfileExists) {
        console.error('Error ensuring inviter profile exists');
        return { error: new Error('Could not verify inviter profile. Please try again or ask for a new code.') };
      }
      
      // Verify that inviter isn't already connected
      const { data: inviterCheck, error: inviterError } = await supabase
        .from('user_profiles')
        .select('id, partner_id')
        .eq('id', partnerCode.inviter_id)
        .maybeSingle();
        
      if (inviterError) {
        console.error('Error verifying inviter profile:', inviterError);
        return { error: new Error('Could not verify inviter profile. Please try again or ask for a new code.') };
      }
      
      if (inviterCheck?.partner_id) {
        console.error('Inviter already has a partner:', inviterCheck.partner_id);
        return { error: new Error('The inviter already has a partner connected. Please ask for a new code.') };
      }
      
      // Process the partner code connection
      console.log('Processing partner code connection...');
      return await handlePartnerConnection(currentUserId, partnerCode.inviter_id, partnerCode.code);
    }
    
    // If no partner code found, check partner_invites
    console.log('No partner code found, checking partner_invites...');
    const { data: invite, error: inviteError } = await supabase
      .from('partner_invites')
      .select('*')
      .eq('token', formattedToken)
      .eq('is_accepted', false)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
      
    if (inviteError) {
      console.error('Failed to query partner_invites:', inviteError);
      return { error: new Error('Failed to validate invitation. Please try again.') };
    }
    
    if (invite) {
      console.log('Found valid partner invite:', invite);
      
      // Check that user isn't inviting themselves
      if (invite.inviter_id === currentUserId) {
        console.error('User tried to accept their own invitation');
        return { error: new Error('You cannot accept your own invitation') };
      }
      
      // Ensure inviter profile exists before attempting connection
      const inviterProfileExists = await ensureProfileExists(invite.inviter_id);
      if (!inviterProfileExists) {
        console.error('Error ensuring inviter profile exists');
        return { error: new Error('Could not verify inviter profile. Please try again or ask for a new invite.') };
      }
      
      // Verify that inviter exists and isn't already connected
      const { data: inviterCheck, error: inviterError } = await supabase
        .from('user_profiles')
        .select('id, partner_id')
        .eq('id', invite.inviter_id)
        .maybeSingle();
        
      if (inviterError) {
        console.error('Error verifying inviter profile:', inviterError);
        return { error: new Error('Could not verify inviter profile. Please try again or ask for a new invite.') };
      }
      
      if (inviterCheck?.partner_id) {
        console.error('Inviter already has a partner:', inviterCheck.partner_id);
        return { error: new Error('The inviter already has a partner connected. Please ask for a new invitation.') };
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
      
      console.log('Processing partner invite connection...');
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
