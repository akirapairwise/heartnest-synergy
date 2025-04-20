
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
    
    // Step 1: Fetch both profiles directly first to verify they exist
    console.log("Directly fetching both profiles to verify they exist...");
    const { data: profiles, error: fetchError } = await supabase
      .from('user_profiles')
      .select('id, partner_id')
      .in('id', [currentUserId, partnerId]);
      
    if (fetchError) {
      console.error("Error fetching user profiles:", fetchError);
      return { error: new Error('Error fetching user profiles. Please try again.') };
    }
    
    const currentUserProfile = profiles?.find(p => p.id === currentUserId);
    const partnerProfile = profiles?.find(p => p.id === partnerId);
    
    // Step 2: Create profiles if they don't exist
    if (!currentUserProfile) {
      console.log(`Profile for current user ${currentUserId} not found, creating it...`);
      const result = await createProfile(currentUserId);
      if (!result.success) {
        return { error: new Error('Could not create your profile. Please try again.') };
      }
    }
    
    if (!partnerProfile) {
      console.log(`Profile for partner ${partnerId} not found, creating it...`);
      const result = await createProfile(partnerId);
      if (!result.success) {
        return { error: new Error('Could not verify inviter profile. Please try again.') };
      }
    }
    
    // Step 3: Fetch profiles again to get the most up-to-date data
    const { data: updatedProfiles, error: refetchError } = await supabase
      .from('user_profiles')
      .select('id, partner_id')
      .in('id', [currentUserId, partnerId]);
      
    if (refetchError || !updatedProfiles) {
      console.error("Error refetching user profiles:", refetchError);
      return { error: new Error('Error retrieving updated profiles. Please try again.') };
    }
    
    const updatedCurrentUserProfile = updatedProfiles.find(p => p.id === currentUserId);
    const updatedPartnerProfile = updatedProfiles.find(p => p.id === partnerId);
    
    if (!updatedCurrentUserProfile || !updatedPartnerProfile) {
      console.error("Profiles still not found after creation attempt");
      return { error: new Error('Failed to verify user profiles. Please try again.') };
    }
    
    // Step 4: Check if either user already has a partner
    if (updatedCurrentUserProfile.partner_id) {
      // Check if already connected to this specific partner (idempotent operation)
      if (updatedCurrentUserProfile.partner_id === partnerId) {
        console.log('Users are already connected to each other');
        return { error: null }; // This is not an error, they're already connected
      }
      
      console.error('Current user already has a different partner:', updatedCurrentUserProfile.partner_id);
      return { error: new Error('You already have a partner. Unlink your current partner before accepting a new invitation.') };
    }
    
    if (updatedPartnerProfile.partner_id) {
      // Check if already connected to this specific user (idempotent operation)
      if (updatedPartnerProfile.partner_id === currentUserId) {
        console.log('Users are already connected to each other');
        return { error: null }; // This is not an error, they're already connected
      }
      
      console.error('Partner already has a different partner:', updatedPartnerProfile.partner_id);
      return { error: new Error('The inviter already has a partner.') };
    }
    
    console.log('Starting partner linking process with atomic transaction...');
    
    // Use the link_partners function for reliability
    try {
      const { error: transactionError } = await supabase.rpc('link_partners', {
        user_id_1: currentUserId,
        user_id_2: partnerId
      });
      
      if (transactionError) {
        console.error('Error in atomic partner linking:', transactionError);
        return { error: new Error('Failed to link partners. Please try again.') };
      }
      
      console.log('Successfully linked partners using atomic operation');
      
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
        const verifiedCurrentUser = verificationData?.find(p => p.id === currentUserId);
        const verifiedPartner = verificationData?.find(p => p.id === partnerId);
        
        if (!verifiedCurrentUser?.partner_id || verifiedCurrentUser.partner_id !== partnerId) {
          console.error('Current user not properly connected to partner after update!');
        }
        
        if (!verifiedPartner?.partner_id || verifiedPartner.partner_id !== currentUserId) {
          console.error('Partner not properly connected to current user after update!');
        }
        
        if ((verifiedCurrentUser?.partner_id === partnerId) && (verifiedPartner?.partner_id === currentUserId)) {
          console.log('Verified bidirectional connection is established correctly!');
        }
      }
      
      return { error: null };
    } catch (transactionError) {
      console.error('Transaction error in linking partners:', transactionError);
      return { error: new Error('Failed to link partners. Please try again.') };
    }
  } catch (error) {
    console.error('Error in handlePartnerConnection:', error);
    return { error };
  }
}

/**
 * Simplified function to create a user profile with better error handling
 */
async function createProfile(userId: string): Promise<{ success: boolean, error?: Error }> {
  try {
    console.log(`Creating profile for user ${userId}...`);
    
    // Try to create the profile
    const { error } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        is_onboarding_complete: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
    if (error) {
      // Handle duplicate key error (profile was created in a race condition)
      if (error.code === '23505') {
        console.log(`Profile already exists for user ${userId} (race condition)`);
        return { success: true };
      }
      
      console.error(`Error creating profile for user ${userId}:`, error);
      return { success: false, error: new Error(`Failed to create profile: ${error.message}`) };
    }
    
    console.log(`Successfully created profile for user ${userId}`);
    return { success: true };
  } catch (error) {
    console.error(`Unexpected error creating profile for user ${userId}:`, error);
    return { success: false, error: error instanceof Error ? error : new Error('Unknown error creating profile') };
  }
}

/**
 * Ensures a user profile exists, creating one if it doesn't
 * For backward compatibility - new code should use the more direct approach above
 */
export async function ensureProfileExists(userId: string): Promise<any> {
  if (!userId) {
    console.error('Cannot ensure profile exists: user ID is null or undefined');
    return null;
  }

  try {
    console.log(`Ensuring profile exists for user: ${userId}`);
    
    // First, check if profile exists with direct query
    const { data: existingProfile, error: checkError } = await supabase
      .from('user_profiles')
      .select('id, partner_id')
      .eq('id', userId)
      .maybeSingle();
    
    if (checkError) {
      console.error(`Error checking if profile exists:`, checkError);
      throw checkError;
    }
    
    // If profile exists, return it
    if (existingProfile) {
      console.log(`Profile already exists for user: ${userId}`);
      return existingProfile;
    }
    
    // Profile doesn't exist, create it
    console.log(`Creating profile for user ${userId}...`);
    
    const { data: newProfile, error: insertError } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        is_onboarding_complete: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .maybeSingle();
    
    if (insertError) {
      // Handle duplicate key violation (concurrent creation)
      if (insertError.code === '23505') {
        console.log(`Profile was created concurrently for user: ${userId}, fetching it again`);
        
        // Fetch the profile that was created concurrently
        const { data: concurrentProfile, error: fetchError } = await supabase
          .from('user_profiles')
          .select('id, partner_id')
          .eq('id', userId)
          .maybeSingle();
          
        if (fetchError) {
          console.error(`Error fetching concurrently created profile: ${fetchError.message}`);
          throw fetchError;
        }
        
        return concurrentProfile;
      }
      
      console.error(`Error creating profile:`, insertError);
      throw insertError;
    }
    
    console.log(`Successfully created profile for user: ${userId}`);
    return newProfile;
  } catch (error) {
    console.error('Unexpected error in ensureProfileExists:', error);
    return null;
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
