
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
    console.log(`Starting partner connection between user ${currentUserId} and partner ${partnerId}`);
    
    // Step 1: Ensure profiles exist for both users with better error handling
    const currentUserProfileExists = await ensureProfileExists(currentUserId);
    if (!currentUserProfileExists) {
      console.error(`Failed to ensure profile exists for current user: ${currentUserId}`);
      return { error: new Error('Could not create or verify your profile. Please try again.') };
    }
    
    const partnerProfileExists = await ensureProfileExists(partnerId);
    if (!partnerProfileExists) {
      console.error(`Failed to ensure profile exists for partner: ${partnerId}`);
      return { error: new Error('Could not create partner profile. Please try again.') };
    }
    
    console.log('Successfully ensured both profiles exist');

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
    
    // Double-check profiles are found
    if (!currentUserProfile) {
      console.error('Current user profile not found in query results');
      return { error: new Error('Your profile could not be verified. Please try again.') };
    }
    
    if (!partnerProfile) {
      console.error('Partner profile not found in query results');
      return { error: new Error('Partner profile could not be verified. Please try again.') };
    }
    
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
    
    console.log('Starting partner linking process with transaction...');
    
    // Step 3: Use transaction pattern to update both profiles atomically
    try {
      // First update - set partner's profile to point to current user
      const { error: updateInviterError } = await supabase
        .from('user_profiles')
        .update({ partner_id: currentUserId })
        .eq('id', partnerId);
        
      if (updateInviterError) {
        console.error('Error linking inviter to current user:', updateInviterError);
        return { error: new Error('Failed to update inviter\'s profile. Please try again.') };
      }
      
      console.log('Linked inviter to current user, now linking current user to inviter...');
      
      // Second update - set current user's profile to point to partner
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
    } catch (transactionError) {
      console.error('Transaction error during partner connection:', transactionError);
      return { error: new Error('An error occurred while connecting partners. Please try again.') };
    }
    
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
    
    // Double-check connection was established correctly
    const { data: verificationData, error: verificationError } = await supabase
      .from('user_profiles')
      .select('id, partner_id')
      .in('id', [currentUserId, partnerId]);
      
    if (verificationError) {
      console.error('Error verifying connection:', verificationError);
      // Non-critical error, we can continue
    } else {
      // Verify both connections
      const updatedCurrentUser = verificationData?.find(p => p.id === currentUserId);
      const updatedPartner = verificationData?.find(p => p.id === partnerId);
      
      if (!updatedCurrentUser?.partner_id || updatedCurrentUser.partner_id !== partnerId) {
        console.error('Current user not properly connected to partner after update!');
      }
      
      if (!updatedPartner?.partner_id || updatedPartner.partner_id !== currentUserId) {
        console.error('Partner not properly connected to current user after update!');
      }
      
      if ((updatedCurrentUser?.partner_id === partnerId) && (updatedPartner?.partner_id === currentUserId)) {
        console.log('Verified bidirectional connection is established correctly!');
      }
    }
    
    return { error: null };
  } catch (error) {
    console.error('Error in handlePartnerConnection:', error);
    return { error };
  }
}

/**
 * Ensures a user profile exists, creating one if it doesn't
 * Enhanced with better race condition handling and retry logic
 */
export async function ensureProfileExists(userId: string): Promise<boolean> {
  try {
    console.log(`Ensuring profile exists for user: ${userId}`);
    
    // Maximum number of attempts to check/create profile
    const MAX_RETRIES = 3;
    let attempt = 0;
    
    while (attempt < MAX_RETRIES) {
      attempt++;
      console.log(`Attempt ${attempt} to ensure profile for user: ${userId}`);
      
      // Check if profile exists first
      const { data: existingProfile, error: checkError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
      
      if (checkError) {
        console.error(`Error checking if profile exists (attempt ${attempt}):`, checkError);
        
        // If permission error, fail fast as retrying won't help
        if (checkError.code === '42501') {
          console.error('Permission denied when checking profile');
          return false;
        }
        
        // For other errors, we'll retry if we have attempts left
        if (attempt < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, 500 * attempt)); // Exponential backoff
          continue;
        } else {
          console.error('Max retries reached when checking profile');
          return false;
        }
      }
      
      // If profile exists, return success
      if (existingProfile) {
        console.log(`Profile already exists for user: ${userId}`);
        return true;
      }
      
      // Profile doesn't exist, try to create it
      console.log(`Creating profile for user ${userId}...`);
      
      try {
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            id: userId,
            is_onboarding_complete: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (!insertError) {
          console.log(`Successfully created profile for user: ${userId}`);
          return true;
        }
        
        // Handle duplicate key violation (concurrent creation)
        if (insertError.code === '23505') {
          console.log(`Profile was created concurrently for user: ${userId}`);
          return true;
        }
        
        console.error(`Error creating profile (attempt ${attempt}):`, insertError);
        
        // For permission errors, fail fast
        if (insertError.code === '42501') {
          console.error('Permission denied when creating profile');
          return false;
        }
        
        // For other errors, try upsert as a fallback on last attempt
        if (attempt === MAX_RETRIES) {
          console.log(`Final attempt: trying upsert for user ${userId}`);
          
          const { error: upsertError } = await supabase
            .from('user_profiles')
            .upsert({
              id: userId,
              is_onboarding_complete: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }, { onConflict: 'id' });
            
          if (!upsertError) {
            console.log(`Successfully upserted profile for user: ${userId}`);
            return true;
          }
          
          console.error('Failed on final upsert attempt:', upsertError);
          return false;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 500 * attempt));
      } catch (createError) {
        console.error(`Unexpected error in profile creation (attempt ${attempt}):`, createError);
        
        if (attempt < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, 500 * attempt));
          continue;
        } else {
          return false;
        }
      }
    }
    
    console.error(`Failed to ensure profile exists for user: ${userId} after ${MAX_RETRIES} attempts`);
    return false;
  } catch (error) {
    console.error('Unexpected error in ensureProfileExists:', error);
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
