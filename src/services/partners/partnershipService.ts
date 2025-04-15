
import { supabase } from "@/integrations/supabase/client";
import { OperationResult } from "./types";
import { formatToken } from "@/hooks/partner-invites/utils";

/**
 * Accepts a partner invitation and connects both users
 */
export const acceptInvitation = async (token: string, currentUserId: string): Promise<OperationResult> => {
  try {
    console.log('Starting invitation acceptance process...');
    console.log('Current user ID:', currentUserId);
    console.log('Token:', formatToken(token));
    
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
      
    if (partnerCode) {
      console.log('Found valid partner code:', partnerCode);
      
      // Check that user isn't connecting to themself
      if (partnerCode.inviter_id === currentUserId) {
        console.error('User tried to accept their own invitation');
        return { error: new Error('You cannot accept your own invitation') };
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

/**
 * Helper function to handle partner connection
 */
async function handlePartnerConnection(
  currentUserId: string,
  partnerId: string,
  code?: string
): Promise<OperationResult> {
  try {
    // Step 1: Check if either user already has a partner
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, partner_id')
      .in('id', [currentUserId, partnerId]);
      
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return { error: new Error('Error verifying profiles. Please try again.') };
    }
    
    // Find current user and partner profiles
    const currentUserProfile = profiles?.find(p => p.id === currentUserId);
    const partnerProfile = profiles?.find(p => p.id === partnerId);
    
    // Create profiles if they don't exist
    if (!currentUserProfile) {
      console.log('Creating profile for current user');
      const { error: createError } = await supabase
        .from('user_profiles')
        .insert({
          id: currentUserId,
          is_onboarding_complete: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (createError && createError.code !== '23505') { // Ignore duplicate key error
        console.error('Error creating current user profile:', createError);
        return { error: new Error('Could not create your profile. Please try again.') };
      }
    } else if (currentUserProfile.partner_id) {
      // Check if already connected to this specific partner (idempotent operation)
      if (currentUserProfile.partner_id === partnerId) {
        console.log('Users are already connected to each other');
        return { error: null }; // This is not an error, they're already connected
      }
      
      console.error('Current user already has a different partner:', currentUserProfile.partner_id);
      return { error: new Error('You already have a partner. Unlink your current partner before accepting a new invitation.') };
    }
    
    if (!partnerProfile) {
      console.log('Creating profile for partner');
      const { error: createError } = await supabase
        .from('user_profiles')
        .insert({
          id: partnerId,
          is_onboarding_complete: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (createError && createError.code !== '23505') { // Ignore duplicate key error
        console.error('Error creating partner profile:', createError);
        return { error: new Error('Could not create partner profile. Please try again.') };
      }
    } else if (partnerProfile.partner_id) {
      // Check if already connected to this specific user (idempotent operation)
      if (partnerProfile.partner_id === currentUserId) {
        console.log('Users are already connected to each other');
        return { error: null }; // This is not an error, they're already connected
      }
      
      console.error('Partner already has a different partner:', partnerProfile.partner_id);
      return { error: new Error('The inviter already has a partner.') };
    }
    
    console.log('Starting partner linking process...');
    
    // Step 2: Create a transaction to link both users
    // First, link the inviter to the current user
    const { error: updateInviterError } = await supabase
      .from('user_profiles')
      .update({ partner_id: currentUserId })
      .eq('id', partnerId);
      
    if (updateInviterError) {
      console.error('Error linking inviter to current user:', updateInviterError);
      return { error: new Error('Failed to update inviter\'s profile. Please try again.') };
    }
    
    console.log('Linked inviter to current user');
    
    // Then, link the current user to the inviter
    const { error: updateCurrentUserError } = await supabase
      .from('user_profiles')
      .update({ partner_id: partnerId })
      .eq('id', currentUserId);
      
    if (updateCurrentUserError) {
      console.error('Error linking current user to inviter:', updateCurrentUserError);
      
      // If we failed to link the current user, we need to rollback the inviter update
      const { error: rollbackError } = await supabase
        .from('user_profiles')
        .update({ partner_id: null })
        .eq('id', partnerId);
        
      if (rollbackError) {
        console.error('Error rolling back inviter update:', rollbackError);
      }
      
      return { error: new Error('Failed to update your profile. Please try again.') };
    }
    
    console.log('Linked current user to inviter. Connection complete!');
    
    // If this was a partner code, mark it as used
    if (code) {
      const { error: updateCodeError } = await supabase
        .from('partner_codes')
        .update({ is_used: true })
        .eq('code', code);
        
      if (updateCodeError) {
        console.error('Error marking partner code as used:', updateCodeError);
        // Non-critical error, we can continue
      }
    }
    
    // Clear any unaccepted invitations from both users to prevent confusion
    await cleanupUnacceptedInvitations(currentUserId);
    await cleanupUnacceptedInvitations(partnerId);
    
    return { error: null };
  } catch (error) {
    console.error('Error in handlePartnerConnection:', error);
    return { error };
  }
}

/**
 * Clean up unaccepted invitations for a user
 */
async function cleanupUnacceptedInvitations(userId: string): Promise<void> {
  try {
    // Clear partner_invites
    const { error: inviteError } = await supabase
      .from('partner_invites')
      .delete()
      .eq('inviter_id', userId)
      .eq('is_accepted', false);
      
    if (inviteError) {
      console.error('Error cleaning up invitations for user:', inviteError);
    }
    
    // Clear partner_codes
    const { error: codeError } = await supabase
      .from('partner_codes')
      .delete()
      .eq('inviter_id', userId)
      .eq('is_used', false);
      
    if (codeError) {
      console.error('Error cleaning up partner codes for user:', codeError);
    }
  } catch (error) {
    console.error('Error cleaning up unaccepted invitations:', error);
  }
}

/**
 * Unlinks two partners and updates related resources
 * Ensures both partners are disconnected from each other
 */
export const unlinkPartner = async (userId: string, partnerId: string | null): Promise<OperationResult> => {
  if (!partnerId) {
    return { error: null }; // Nothing to unlink
  }
  
  try {
    console.log('Starting partner unlinking process...');
    console.log('User ID:', userId);
    console.log('Partner ID:', partnerId);
    
    // Begin a transaction for consistent updates
    // First, update shared resources
    
    // 1. Update shared goals to no longer be shared
    const { error: updateGoalsError } = await supabase
      .from('goals')
      .update({ 
        is_shared: false,
        partner_id: null 
      })
      .eq('owner_id', userId)
      .eq('partner_id', partnerId);
      
    if (updateGoalsError) {
      console.error('Error updating goals:', updateGoalsError);
      // Non-critical error, continue with the unlinking
    }
    
    // 2. Also update goals where the current user is the partner
    const { error: updatePartnerGoalsError } = await supabase
      .from('goals')
      .update({ 
        is_shared: false,
        partner_id: null 
      })
      .eq('owner_id', partnerId)
      .eq('partner_id', userId);
      
    if (updatePartnerGoalsError) {
      console.error('Error updating partner goals:', updatePartnerGoalsError);
      // Non-critical error, continue
    }
    
    // Critical: Get both profiles to check their current connection status
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, partner_id')
      .in('id', [userId, partnerId]);
      
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return { error: new Error('Could not verify connection status') };
    }
    
    // Find the current user and partner profiles
    const currentUserProfile = profiles?.find(p => p.id === userId);
    const partnerProfile = profiles?.find(p => p.id === partnerId);
    
    // Verify that the partnership is valid before proceeding
    if (!currentUserProfile || !partnerProfile) {
      console.error('Could not find one or both profiles');
      return { error: new Error('Could not find one or both profiles') };
    }
    
    // Verify the connection is still valid (both users are connected to each other)
    if (currentUserProfile.partner_id !== partnerId) {
      console.log('Current user is no longer connected to this partner');
      // If current user is already disconnected, just update partner if needed
      if (partnerProfile.partner_id === userId) {
        // Partner still thinks they're connected, update their profile
        const { error: unlinkPartnerError } = await supabase
          .from('user_profiles')
          .update({ partner_id: null })
          .eq('id', partnerId);
          
        if (unlinkPartnerError) {
          console.error('Error unlinking partner only:', unlinkPartnerError);
          return { error: new Error('Failed to update partner connection status') };
        }
      }
      return { error: null }; // Current user already disconnected
    }
    
    if (partnerProfile.partner_id !== userId) {
      console.log('Partner is no longer connected to this user');
      // If partner is already disconnected, just update current user
      const { error: unlinkUserError } = await supabase
        .from('user_profiles')
        .update({ partner_id: null })
        .eq('id', userId);
        
      if (unlinkUserError) {
        console.error('Error unlinking user only:', unlinkUserError);
        return { error: new Error('Failed to update your connection status') };
      }
      return { error: null }; // Partner already disconnected
    }
    
    // 3. Unlink the current user - critical: only update current user's own record
    const { error: unlinkUserError } = await supabase
      .from('user_profiles')
      .update({ partner_id: null })
      .eq('id', userId);
      
    if (unlinkUserError) {
      console.error('Error unlinking user:', unlinkUserError);
      throw unlinkUserError;
    }
    
    // 4. Unlink the partner - critical: only update partner's own record
    const { error: unlinkPartnerError } = await supabase
      .from('user_profiles')
      .update({ partner_id: null })
      .eq('id', partnerId);
      
    if (unlinkPartnerError) {
      console.error('Error unlinking partner:', unlinkPartnerError);
      throw unlinkPartnerError;
    }
    
    console.log('Partner connection successfully broken');
    
    return { error: null };
  } catch (error) {
    console.error('Error unlinking partner:', error);
    return { error };
  }
};
