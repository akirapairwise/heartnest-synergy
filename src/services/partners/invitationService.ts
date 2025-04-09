import { supabase } from "@/integrations/supabase/client";
import { User } from '@supabase/supabase-js';
import { PartnerInvite, InvitationResult, InvitationsResult } from "./types";
import { calculateExpirationDate, generateToken, enhanceInviteWithInviterName } from "./utils";

/**
 * Creates a new partner invitation
 */
export const createInvitation = async (user: User): Promise<InvitationResult> => {
  try {
    // Check if user already has a partner
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('partner_id')
      .eq('id', user.id)
      .single();
      
    if (profileError) throw profileError;
    
    if (userProfile?.partner_id) {
      console.log('User already has a partner, cannot create invitation');
      return { 
        data: null, 
        error: new Error('You already have a partner. You must unlink your current partner before creating a new invitation.') 
      };
    }
    
    // Delete existing non-accepted invitations from this user
    const { error: deleteError } = await supabase
      .from('partner_invites')
      .delete()
      .eq('inviter_id', user.id)
      .eq('is_accepted', false)
      .gt('expires_at', new Date().toISOString());
      
    if (deleteError) {
      console.error('Error cleaning up old invitations:', deleteError);
    }
    
    // Generate token and expiration date
    const token = generateToken();
    const expiresAt = calculateExpirationDate();
    
    // Create a new invite
    const { data, error } = await supabase
      .from('partner_invites')
      .insert({
        inviter_id: user.id,
        token,
        expires_at: expiresAt
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return { data: data as PartnerInvite, error: null };
  } catch (error) {
    console.error('Error creating partner invitation:', error);
    return { data: null, error };
  }
};

/**
 * Gets a partner invitation by token
 */
export const getInvitationByToken = async (token: string): Promise<InvitationResult> => {
  try {
    const now = new Date().toISOString();
    
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
    
    // Enhance the invite with the inviter's name
    const enhancedInvite = await enhanceInviteWithInviterName(invite as PartnerInvite);
    return { data: enhancedInvite, error: null };
  } catch (error) {
    console.error('Error fetching invitation:', error);
    return { data: null, error };
  }
};

/**
 * Gets all active partner invitations for a user
 */
export const getUserInvitations = async (userId: string): Promise<InvitationsResult> => {
  try {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('partner_invites')
      .select('*')
      .eq('inviter_id', userId)
      .eq('is_accepted', false)
      .gt('expires_at', now)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return { data: data as PartnerInvite[], error: null };
  } catch (error) {
    console.error('Error fetching partner invitations:', error);
    return { data: null, error };
  }
};

/**
 * Regenerates an invitation token
 * This will invalidate the old token and create a new one with a fresh expiration date
 */
export const regenerateToken = async (userId: string): Promise<InvitationResult> => {
  try {
    // First check if the user has an active invitation
    const { data: existingInvites, error: fetchError } = await supabase
      .from('partner_invites')
      .select('*')
      .eq('inviter_id', userId)
      .eq('is_accepted', false)
      .gt('expires_at', new Date().toISOString())
      .limit(1);
      
    if (fetchError) throw fetchError;
    
    if (!existingInvites || existingInvites.length === 0) {
      return { 
        data: null, 
        error: new Error('No active invitation found to regenerate') 
      };
    }
    
    // Generate a new token and expiration date
    const newToken = generateToken();
    const newExpiresAt = calculateExpirationDate();
    
    // Update the existing invitation with the new token and expiration
    const { data, error: updateError } = await supabase
      .from('partner_invites')
      .update({
        token: newToken,
        expires_at: newExpiresAt
      })
      .eq('id', existingInvites[0].id)
      .select()
      .single();
      
    if (updateError) throw updateError;
    
    return { data: data as PartnerInvite, error: null };
  } catch (error) {
    console.error('Error regenerating invitation token:', error);
    return { data: null, error };
  }
};
