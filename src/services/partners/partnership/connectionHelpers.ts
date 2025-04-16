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
    const currentUserProfile = await ensureProfileExists(currentUserId);
    if (!currentUserProfile) {
      console.error(`Failed to ensure profile exists for current user: ${currentUserId}`);
      return { error: new Error('Could not create or verify your profile. Please try again.') };
    }
    
    const partnerProfile = await ensureProfileExists(partnerId);
    if (!partnerProfile) {
      console.error(`Failed to ensure profile exists for partner: ${partnerId}`);
      return { error: new Error('Could not create or verify partner profile. Please try again.') };
    }
    
    console.log('Successfully ensured both profiles exist:', { 
      currentUserProfile: currentUserProfile.id,
      partnerProfile: partnerProfile.id
    });

    // Step 2: Check if either user already has a partner
    if (currentUserProfile.partner_id) {
      // Check if already connected to this specific partner (idempotent operation)
      if (currentUserProfile.partner_id === partnerId) {
        console.log('Users are already connected to each other');
        return { error: null }; // This is not an error, they're already connected
      }
      
      console.error('Current user already has a different partner:', currentUserProfile.partner_id);
      return { error: new Error('You already have a partner. Unlink your current partner before accepting a new invitation.') };
    }
    
    if (partnerProfile.partner_id) {
      // Check if already connected to this specific user (idempotent operation)
      if (partnerProfile.partner_id === currentUserId) {
        console.log('Users are already connected to each other');
        return { error: null }; // This is not an error, they're already connected
      }
      
      console.error('Partner already has a different partner:', partnerProfile.partner_id);
      return { error: new Error('The inviter already has a partner.') };
    }
    
    console.log('Starting partner linking process with atomic transaction...');
    
    // Step 3: Use transaction pattern to update both profiles atomically
    // First update both profiles in a single atomic operation
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
export async function ensureProfileExists(userId: string): Promise<any> {
  if (!userId) {
    console.error('Cannot ensure profile exists: user ID is null or undefined');
    return null;
  }

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
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (checkError) {
        console.error(`Error checking if profile exists (attempt ${attempt}):`, checkError);
        
        // If permission error, fail fast as retrying won't help
        if (checkError.code === '42501') {
          console.error('Permission denied when checking profile');
          await new Promise(resolve => setTimeout(resolve, 500));
          continue;
        }
      }
      
      // If profile exists, return it
      if (existingProfile) {
        console.log(`Profile already exists for user: ${userId}`, existingProfile);
        return existingProfile;
      }
      
      // Profile doesn't exist, try to create it
      console.log(`Creating profile for user ${userId}...`);
      
      try {
        const { data: newProfile, error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            id: userId,
            is_onboarding_complete: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (!insertError && newProfile) {
          console.log(`Successfully created profile for user: ${userId}`, newProfile);
          return newProfile;
        }
        
        // Handle duplicate key violation (concurrent creation)
        if (insertError && insertError.code === '23505') {
          console.log(`Profile was created concurrently for user: ${userId}, fetching it now`);
          
          // Wait a moment before fetching again
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Fetch the profile that was created concurrently
          const { data: concurrentProfile, error: fetchError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
            
          if (!fetchError && concurrentProfile) {
            console.log(`Successfully fetched concurrently created profile for user: ${userId}`, concurrentProfile);
            return concurrentProfile;
          }
          
          if (fetchError) {
            console.error(`Error fetching concurrently created profile: ${fetchError.message}`);
          }
        } else if (insertError) {
          console.error(`Error creating profile (attempt ${attempt}):`, insertError);
        }
        
        // Try upsert as a fallback if insertion failed
        if (attempt === MAX_RETRIES - 1) {
          console.log(`Trying upsert for user ${userId} as fallback`);
          
          const { data: upsertedProfile, error: upsertError } = await supabase
            .from('user_profiles')
            .upsert({
              id: userId,
              is_onboarding_complete: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }, { 
              onConflict: 'id',
              ignoreDuplicates: false 
            })
            .select()
            .single();
            
          if (!upsertError && upsertedProfile) {
            console.log(`Successfully upserted profile for user: ${userId}`, upsertedProfile);
            return upsertedProfile;
          }
          
          if (upsertError) {
            console.error('Failed on upsert attempt:', upsertError);
          }
        }
      } catch (createError) {
        console.error(`Unexpected error in profile creation (attempt ${attempt}):`, createError);
      }
      
      // Wait before retrying with exponential backoff
      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, 500 * attempt));
      }
    }
    
    // One last attempt to fetch the profile directly
    const { data: finalProfile, error: finalError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (!finalError && finalProfile) {
      console.log(`Found profile on final check for user: ${userId}`, finalProfile);
      return finalProfile;
    }
    
    console.error(`Failed to ensure profile exists for user: ${userId} after ${MAX_RETRIES} attempts`);
    return null;
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
