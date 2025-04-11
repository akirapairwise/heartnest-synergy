
import { supabase } from '@/integrations/supabase/client';
import { PartnerInvite, InviteResult } from './types';
import { ensureUserProfile } from '@/services/partnerCodeService';
import { formatToken } from './utils';

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
    // Always uppercase the token for consistency
    const formattedToken = formatToken(token);
    
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
    
    // Delete any existing invitations from this user
    const { error: deleteError } = await supabase
      .from('partner_invites')
      .delete()
      .eq('inviter_id', userId)
      .eq('is_accepted', false);
      
    if (deleteError) {
      console.error('Error cleaning up old invitations:', deleteError);
      // Continue anyway, non-critical error
    }
    
    // Insert new invitation
    const { data, error } = await supabase
      .from('partner_invites')
      .insert({
        inviter_id: userId,
        token: formattedToken,
        expires_at: expiresAt.toISOString(),
        is_accepted: false
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating invitation:', error);
      return { success: false, error };
    }
    
    console.log('Successfully created invitation with token:', formattedToken);
    
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
    // Always uppercase the token for consistency
    const formattedToken = formatToken(token);
    
    console.log('Accepting invitation with token:', formattedToken);
    
    // Ensure user profile exists first with a direct query
    const { data: currentUserProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, partner_id')
      .eq('id', userId)
      .maybeSingle();
      
    if (profileError) {
      console.error('Error fetching current user profile:', profileError);
      throw new Error('Could not retrieve your profile');
    }
    
    // Create profile if it doesn't exist
    if (!currentUserProfile) {
      const { error: createError } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          is_onboarding_complete: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (createError) {
        console.error('Error creating user profile:', createError);
        throw new Error('Could not create your profile');
      }
    } else if (currentUserProfile.partner_id) {
      return { error: new Error('You already have a partner connected') };
    }
    
    // First try partner_codes table
    console.log('Checking partner_codes table first...');
    const { data: partnerCode, error: codeError } = await supabase
      .from('partner_codes')
      .select('inviter_id, code')
      .eq('code', formattedToken)
      .eq('is_used', false)
      .or('expires_at.is.null,expires_at.gt.now()')
      .maybeSingle();
      
    if (partnerCode) {
      console.log('Found matching partner code:', partnerCode);
      
      // Check if the user is trying to accept their own invitation
      if (partnerCode.inviter_id === userId) {
        return { error: new Error('You cannot accept your own invitation') };
      }
      
      return await linkPartners(userId, partnerCode.inviter_id, partnerCode.code);
    } else {
      console.log('No partner code found, trying partner_invites table...');
    }
    
    // If not found in partner_codes, try partner_invites
    const { data: invite, error: tokenError } = await supabase
      .from('partner_invites')
      .select('*')
      .eq('token', formattedToken)
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
    
    // Update invitation status
    const { error: updateInviteError } = await supabase
      .from('partner_invites')
      .update({ is_accepted: true })
      .eq('id', invite.id);
      
    if (updateInviteError) {
      console.error('Error updating invitation status:', updateInviteError);
      throw updateInviteError;
    }
    
    return await linkPartners(userId, invite.inviter_id);
  } catch (err) {
    console.error('Error accepting invitation:', err);
    return { error: err instanceof Error ? err : new Error('Failed to accept invitation') };
  }
};

// Helper function to link two users as partners
const linkPartners = async (
  userId: string, 
  partnerId: string, 
  partnerCode?: string
): Promise<{ error: Error | null }> => {
  try {
    // Ensure inviter's profile exists
    const { data: inviterProfile, error: inviterProfileError } = await supabase
      .from('user_profiles')
      .select('id, partner_id')
      .eq('id', partnerId)
      .maybeSingle();
      
    if (inviterProfileError) {
      console.error('Error fetching inviter profile:', inviterProfileError);
      throw new Error('Could not retrieve the inviter\'s profile');
    }
    
    // Create inviter profile if it doesn't exist
    if (!inviterProfile) {
      const { error: createInviterError } = await supabase
        .from('user_profiles')
        .insert({
          id: partnerId,
          is_onboarding_complete: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (createInviterError) {
        console.error('Error creating inviter profile:', createInviterError);
        throw new Error('Could not create the inviter\'s profile');
      }
    } else if (inviterProfile.partner_id) {
      return { error: new Error('The inviter already has a partner') };
    }
    
    // Link the users as partners - update inviter's profile
    const { error: updateInviterError } = await supabase
      .from('user_profiles')
      .update({ partner_id: userId })
      .eq('id', partnerId);
      
    if (updateInviterError) {
      console.error('Error updating inviter profile:', updateInviterError);
      throw updateInviterError;
    }
    
    // Update current user's profile separately
    const { error: updateUserError } = await supabase
      .from('user_profiles')
      .update({ partner_id: partnerId })
      .eq('id', userId);
      
    if (updateUserError) {
      console.error('Error updating user profile:', updateUserError);
      throw updateUserError;
    }
    
    // If this was a partner code, mark it as used
    if (partnerCode) {
      const { error: updateCodeError } = await supabase
        .from('partner_codes')
        .update({ is_used: true })
        .eq('code', partnerCode);
        
      if (updateCodeError) {
        console.error('Error marking partner code as used:', updateCodeError);
        // Not throwing error here as the partnership is already established
      }
    }
    
    return { error: null };
  } catch (err) {
    console.error('Error linking partners:', err);
    return { error: err instanceof Error ? err : new Error('Failed to link partners') };
  }
};

// Function to delete existing invitations and create a new one
export const regenerateInvitation = async (userId: string, token: string): Promise<InviteResult> => {
  try {
    // Always uppercase the token for consistency
    const formattedToken = formatToken(token);
    
    // Delete any existing invitations
    await supabase
      .from('partner_invites')
      .delete()
      .eq('inviter_id', userId)
      .eq('is_accepted', false);
    
    // Create a new invitation
    return await createNewInvitation(userId, formattedToken);
  } catch (err) {
    console.error('Error regenerating token:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err : new Error('Failed to regenerate invitation') 
    };
  }
};
