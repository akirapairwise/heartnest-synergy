
import { supabase } from '@/integrations/supabase/client';
import { PartnerInvite, InviteResult } from './types';
import { ensureUserProfile } from '@/services/partnerCodeService';

// Function to fetch the current active invitation
export const fetchActiveInvite = async (userId: string): Promise<PartnerInvite | null> => {
  if (!userId) return null;
  
  try {
    // Ensure profile exists first
    await ensureUserProfile(userId);
    
    const { data, error } = await supabase
      .from('partner_invites')
      .select('*')
      .eq('inviter_id', userId)
      .eq('is_accepted', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching active invite:', error);
      return null;
    }
    
    return data as PartnerInvite | null;
  } catch (err) {
    console.error('Unexpected error fetching active invite:', err);
    return null;
  }
};

// Create a new invitation
export const createNewInvitation = async (userId: string, token: string): Promise<InviteResult> => {
  try {
    // First ensure user profile exists
    const profile = await ensureUserProfile(userId);
    if (!profile) {
      return { 
        success: false, 
        error: new Error('Could not create or retrieve your profile') 
      };
    }
    
    // Check if user already has a partner
    if (profile.partner_id) {
      return { 
        success: false, 
        error: new Error('You already have a partner connected') 
      };
    }
    
    // Set expiration date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    // Insert new invitation
    const { data, error } = await supabase
      .from('partner_invites')
      .insert({
        inviter_id: userId,
        token,
        expires_at: expiresAt.toISOString(),
        is_accepted: false
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating invitation:', error);
      return { success: false, error };
    }
    
    return { success: true, invite: data as PartnerInvite };
  } catch (err) {
    console.error('Error creating invitation:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err : new Error('Failed to create invitation') 
    };
  }
};

// Function to handle accepting an invitation
export const acceptInvite = async (userId: string, token: string): Promise<{ error: Error | null }> => {
  if (!userId) {
    return { error: new Error('Authentication required') };
  }
  
  try {
    // Ensure user profile exists first
    const currentUserProfile = await ensureUserProfile(userId);
    if (!currentUserProfile) {
      throw new Error('Could not create or retrieve your profile');
    }
    
    // Check if user already has a partner
    if (currentUserProfile.partner_id) {
      return { error: new Error('You already have a partner connected') };
    }
    
    // Validate the token
    const { data: invite, error: tokenError } = await supabase
      .from('partner_invites')
      .select('*')
      .eq('token', token)
      .eq('is_accepted', false)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
    
    if (tokenError) {
      console.error('Error validating token:', tokenError);
      throw tokenError;
    }
    
    if (!invite) {
      return { error: new Error('This invitation is invalid, expired, or has already been used') };
    }
    
    // Check if the user is trying to accept their own invitation
    if (invite.inviter_id === userId) {
      return { error: new Error('You cannot accept your own invitation') };
    }
    
    // Ensure inviter's profile exists
    const inviterProfile = await ensureUserProfile(invite.inviter_id);
    if (!inviterProfile) {
      throw new Error('Could not retrieve the inviter\'s profile');
    }
    
    // Check if inviter already has a partner
    if (inviterProfile.partner_id) {
      return { error: new Error('The inviter already has a partner') };
    }
    
    // Update invitation status
    const { error: updateInviteError } = await supabase
      .from('partner_invites')
      .update({ is_accepted: true })
      .eq('id', invite.id);
      
    if (updateInviteError) {
      console.error('Error updating invitation status:', updateInviteError);
      throw updateInviteError;
    }
    
    // Link the users as partners
    // 1. Update inviter's profile
    const { error: updateInviterError } = await supabase
      .from('user_profiles')
      .update({ partner_id: userId })
      .eq('id', invite.inviter_id);
      
    if (updateInviterError) {
      console.error('Error updating inviter profile:', updateInviterError);
      throw updateInviterError;
    }
    
    // 2. Update current user's profile
    const { error: updateUserError } = await supabase
      .from('user_profiles')
      .update({ partner_id: invite.inviter_id })
      .eq('id', userId);
      
    if (updateUserError) {
      console.error('Error updating user profile:', updateUserError);
      throw updateUserError;
    }
    
    return { error: null };
  } catch (err) {
    console.error('Error accepting invitation:', err);
    return { error: err instanceof Error ? err : new Error('Failed to accept invitation') };
  }
};

// Function to delete existing invitations and create a new one
export const regenerateInvitation = async (userId: string, token: string): Promise<InviteResult> => {
  try {
    // Delete any existing invitations
    await supabase
      .from('partner_invites')
      .delete()
      .eq('inviter_id', userId)
      .eq('is_accepted', false);
    
    // Create a new invitation
    return await createNewInvitation(userId, token);
  } catch (err) {
    console.error('Error regenerating token:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err : new Error('Failed to regenerate invitation') 
    };
  }
};
