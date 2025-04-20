
import { supabase } from "@/integrations/supabase/client";
import { OperationResult } from "../types";

/**
 * Ensures a user profile exists and creates one if needed
 */
export const ensureProfileExists = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    console.log(`Ensuring profile exists for user: ${userId}`);
    
    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking for existing profile:', checkError);
      return false;
    }
    
    // Profile exists, no need to create
    if (existingProfile) {
      console.log(`Profile already exists for user: ${userId}`);
      return true;
    }
    
    // Create profile if not exists
    console.log(`Creating profile for user: ${userId}`);
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
      return false;
    }
    
    console.log(`Successfully created profile for user: ${userId}`);
    return true;
  } catch (error) {
    console.error(`Unexpected error in ensureProfileExists for ${userId}:`, error);
    return false;
  }
};

/**
 * Handles connecting partners using database function for atomicity
 * This uses the Supabase function link_partners for atomic connection
 */
export const handlePartnerConnection = async (
  currentUserId: string, 
  partnerId: string,
  partnerCode?: string
): Promise<OperationResult> => {
  console.log(`Connecting partners: ${currentUserId} with ${partnerId}`);
  
  try {
    // First ensure both profiles exist
    const currentUserProfileExists = await ensureProfileExists(currentUserId);
    if (!currentUserProfileExists) {
      return { error: new Error('Failed to create or verify your profile') };
    }
    
    const partnerProfileExists = await ensureProfileExists(partnerId);
    if (!partnerProfileExists) {
      return { error: new Error('Could not verify the partner profile') };
    }
    
    // Use database function for atomic connection
    const { data, error } = await supabase.rpc('link_partners', {
      user_id_1: currentUserId,
      user_id_2: partnerId
    });
    
    if (error) {
      console.error('Error connecting partners:', error);
      return { error: new Error('Failed to establish partner connection') };
    }
    
    // If we have a partner code, mark it as used
    if (partnerCode) {
      const { error: codeUpdateError } = await supabase
        .from('partner_codes')
        .update({ is_used: true })
        .eq('code', partnerCode);
        
      if (codeUpdateError) {
        console.error('Error marking partner code as used:', codeUpdateError);
        // Don't return error here since the connection is already established
      }
    }
    
    // Verify the connection was successful by checking both profiles
    const { data: verificationData, error: verificationError } = await supabase
      .from('user_profiles')
      .select('id, partner_id')
      .in('id', [currentUserId, partnerId]);
      
    if (verificationError || !verificationData || verificationData.length !== 2) {
      console.error('Error verifying partnership connection:', verificationError);
      return { error: new Error('Partnership connection could not be verified') };
    }
    
    // Check that the partner IDs match properly
    const currentUserProfile = verificationData.find(profile => profile.id === currentUserId);
    const partnerProfile = verificationData.find(profile => profile.id === partnerId);
    
    if (!currentUserProfile || !partnerProfile || 
        currentUserProfile.partner_id !== partnerId || 
        partnerProfile.partner_id !== currentUserId) {
      console.error('Partnership connection verification failed. IDs do not match correctly.');
      return { error: new Error('Partnership connection could not be properly verified') };
    }
    
    console.log('Partner connection successful and verified!');
    return { error: null };
  } catch (error) {
    console.error('Unexpected error in handlePartnerConnection:', error);
    return { error };
  }
};
