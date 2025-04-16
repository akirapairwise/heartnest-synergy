
import { supabase } from "@/integrations/supabase/client";
import { OperationResult } from "../types";

/**
 * Helper function to handle partner connection
 */
export async function handlePartnerConnection(
  currentUserId: string,
  partnerId: string,
  code?: string
): Promise<OperationResult> {
  try {
    // Step 1: Ensure profiles exist for both users
    await ensureProfileExists(currentUserId);
    await ensureProfileExists(partnerId);

    // Step 2: Check if either user already has a partner
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
    
    // Check for existing partners
    if (currentUserProfile?.partner_id) {
      // Check if already connected to this specific partner (idempotent operation)
      if (currentUserProfile.partner_id === partnerId) {
        console.log('Users are already connected to each other');
        return { error: null }; // This is not an error, they're already connected
      }
      
      console.error('Current user already has a different partner:', currentUserProfile.partner_id);
      return { error: new Error('You already have a partner. Unlink your current partner before accepting a new invitation.') };
    }
    
    if (partnerProfile?.partner_id) {
      // Check if already connected to this specific user (idempotent operation)
      if (partnerProfile.partner_id === currentUserId) {
        console.log('Users are already connected to each other');
        return { error: null }; // This is not an error, they're already connected
      }
      
      console.error('Partner already has a different partner:', partnerProfile.partner_id);
      return { error: new Error('The inviter already has a partner.') };
    }
    
    console.log('Starting partner linking process...');
    
    // Step 3: Create a transaction to link both users
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
 * Ensures a user profile exists, creating one if it doesn't
 */
export async function ensureProfileExists(userId: string): Promise<boolean> {
  try {
    console.log(`Ensuring profile exists for user: ${userId}`);
    
    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
      
    if (!profileError && profile) {
      // Profile exists
      return true;
    }
    
    // If profile doesn't exist, create one
    if (profileError && profileError.code === 'PGRST116') {
      console.log(`Creating profile for user ${userId}...`);
      const { error: createError } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          is_onboarding_complete: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (createError) {
        // Check for duplicate key error (which means profile was created concurrently)
        if (createError.code === '23505') {
          console.log('Profile already exists (concurrent creation)');
          return true;
        }
        
        console.error('Error creating profile:', createError);
        return false;
      }
      
      return true;
    }
    
    console.error('Unexpected error checking profile:', profileError);
    return false;
  } catch (error) {
    console.error('Error in ensureProfileExists:', error);
    return false;
  }
}

/**
 * Clean up unaccepted invitations for a user
 */
export async function cleanupUnacceptedInvitations(userId: string): Promise<void> {
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
