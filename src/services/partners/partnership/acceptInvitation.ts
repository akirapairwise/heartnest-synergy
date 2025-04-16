
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
      
      // Check if current user already has a partner
      const { data: currentUser, error: currentUserError } = await supabase
        .from('user_profiles')
        .select('partner_id')
        .eq('id', currentUserId)
        .maybeSingle();
        
      if (currentUserError) {
        console.error('Error fetching current user:', currentUserError);
        return { error: new Error('Error verifying your profile. Please try again.') };
      }
      
      if (currentUser?.partner_id) {
        console.error('Current user already has a partner:', currentUser.partner_id);
        return { error: new Error('You already have a partner. Unlink your current partner before accepting a new invitation.') };
      }
      
      // Check if inviter already has a partner
      const { data: inviter, error: inviterError } = await supabase
        .from('user_profiles')
        .select('partner_id')
        .eq('id', partnerCode.inviter_id)
        .maybeSingle();
        
      if (inviterError) {
        console.error('Error fetching inviter:', inviterError);
        return { error: new Error('Error verifying inviter profile. Please try again.') };
      }
      
      if (inviter?.partner_id) {
        console.error('Inviter already has a partner:', inviter.partner_id);
        return { error: new Error('The inviter already has a partner.') };
      }
      
      // Process the partner code connection
      console.log('Processing partner code connection...');
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
      return { error: new Error('Failed to validate invitation. Please try again.') };
    }
    
    if (invite) {
      console.log('Found valid partner invite:', invite);
      
      // Check that user isn't inviting themselves
      if (invite.inviter_id === currentUserId) {
        console.error('User tried to accept their own invitation');
        return { error: new Error('You cannot accept your own invitation') };
      }
      
      // Check if current user already has a partner
      const { data: currentUser, error: currentUserError } = await supabase
        .from('user_profiles')
        .select('partner_id')
        .eq('id', currentUserId)
        .maybeSingle();
        
      if (currentUserError) {
        console.error('Error fetching current user:', currentUserError);
        return { error: new Error('Error verifying your profile. Please try again.') };
      }
      
      if (currentUser?.partner_id) {
        console.error('Current user already has a partner:', currentUser.partner_id);
        return { error: new Error('You already have a partner. Unlink your current partner before accepting a new invitation.') };
      }
      
      // Check if inviter already has a partner
      const { data: inviter, error: inviterError } = await supabase
        .from('user_profiles')
        .select('partner_id')
        .eq('id', invite.inviter_id)
        .maybeSingle();
        
      if (inviterError) {
        console.error('Error fetching inviter:', inviterError);
        return { error: new Error('Error verifying inviter profile. Please try again.') };
      }
      
      if (inviter?.partner_id) {
        console.error('Inviter already has a partner:', inviter.partner_id);
        return { error: new Error('The inviter already has a partner.') };
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
