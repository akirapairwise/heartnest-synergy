
import { supabase } from "@/integrations/supabase/client";
import { OperationResult } from "./types";
import { PartnerCode, PartnerCodeInsert } from "@/types/partnerCodes";
import { toast } from 'sonner';
import { Profile } from "@/types/auth";

/**
 * Generates a new partner code for the current user
 */
export const generatePartnerCode = async (userId: string): Promise<{code: string | null, error: any}> => {
  try {
    // Delete any existing non-used codes for this user first
    await supabase
      .from('partner_codes')
      .delete()
      .eq('inviter_id', userId)
      .eq('is_used', false);
      
    // Call the database function to generate a random code
    const { data: codeData, error: codeError } = await supabase.rpc('generate_partner_code');
    
    if (codeError) throw codeError;
    
    const code = codeData as string;
    
    // Insert the new code into the partner_codes table
    const { error: insertError } = await supabase
      .from('partner_codes')
      .insert({
        code,
        inviter_id: userId,
        is_used: false
      } as PartnerCodeInsert);
      
    if (insertError) throw insertError;
    
    return { code, error: null };
  } catch (error) {
    console.error('Error generating partner code:', error);
    return { code: null, error };
  }
};

/**
 * Gets the current user's active partner code
 */
export const getCurrentUserCode = async (userId: string): Promise<{code: string | null, error: any}> => {
  try {
    const { data, error } = await supabase
      .from('partner_codes')
      .select('code')
      .eq('inviter_id', userId)
      .eq('is_used', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
    
    return { code: data?.code || null, error: null };
  } catch (error) {
    console.error('Error fetching current user code:', error);
    return { code: null, error };
  }
};

/**
 * Ensures a user profile exists, creating it if needed
 */
const ensureUserProfile = async (userId: string, name?: string): Promise<{profile: Profile | null, error: any}> => {
  try {
    // First try to get the profile
    const { data: profileData, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (error) throw error;
    
    // If profile exists, cast it to the correct type and return it
    if (profileData) {
      // Convert the JSON type to the expected Profile type
      const profile: Profile = {
        ...profileData,
        mood_settings: profileData.mood_settings as { 
          showAvatar?: boolean; 
          defaultMood?: string;
        } | null
      };
      return { profile, error: null };
    }
    
    // Profile doesn't exist, create it
    console.log('Creating profile for user:', userId);
    
    const { data: newProfileData, error: createError } = await supabase
      .from('user_profiles')
      .insert({ 
        id: userId,
        full_name: name || 'Partner',
        is_onboarding_complete: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (createError) throw createError;
    
    // Cast the new profile to the correct type
    const newProfile: Profile = {
      ...newProfileData,
      mood_settings: newProfileData.mood_settings as {
        showAvatar?: boolean;
        defaultMood?: string;
      } | null
    };
    
    return { profile: newProfile, error: null };
  } catch (error) {
    console.error('Error ensuring user profile exists:', error);
    return { profile: null, error };
  }
};

/**
 * Redeems a partner code to connect two users
 */
export const redeemPartnerCode = async (currentUserId: string, code: string): Promise<OperationResult> => {
  try {
    console.log('Starting to redeem partner code:', code, 'for user:', currentUserId);
    
    // First find the code
    const { data: partnerCode, error: codeError } = await supabase
      .from('partner_codes')
      .select('inviter_id, is_used')
      .eq('code', code.toUpperCase())
      .maybeSingle() as { data: PartnerCode | null, error: any };
      
    if (codeError) {
      console.error('Error fetching partner code:', codeError);
      throw codeError;
    }
    
    if (!partnerCode) {
      return { error: new Error('Invalid partner code. Please check and try again.') };
    }
    
    if (partnerCode.is_used) {
      return { error: new Error('This partner code has already been used.') };
    }
    
    // Check if code is their own
    if (partnerCode.inviter_id === currentUserId) {
      return { error: new Error('You cannot use your own partner code.') };
    }
    
    console.log('Valid partner code found. Inviter ID:', partnerCode.inviter_id);
    
    // Ensure both profiles exist
    // 1. First, ensure the inviter's profile exists
    const { profile: inviterProfile, error: inviterError } = await ensureUserProfile(partnerCode.inviter_id);
    
    if (inviterError || !inviterProfile) {
      console.error('Error ensuring inviter profile exists:', inviterError);
      return { error: new Error('Unable to complete invitation. Please try again later.') };
    }
    
    // 2. Ensure the current user's profile exists
    const { profile: currentUserProfile, error: userError } = await ensureUserProfile(currentUserId);
    
    if (userError || !currentUserProfile) {
      console.error('Error ensuring current user profile exists:', userError);
      return { error: new Error('Unable to complete invitation. Please try again later.') };
    }
    
    console.log('Both profiles confirmed:', { 
      inviter: inviterProfile.id,
      currentUser: currentUserProfile.id
    });
    
    // Check if either user already has a partner
    if (inviterProfile.partner_id) {
      return { error: new Error('The code owner already has a partner.') };
    }
    
    if (currentUserProfile.partner_id) {
      return { error: new Error('You already have a partner. Disconnect first before connecting to someone else.') };
    }
    
    // Start transaction to link both users
    console.log('Linking users:', inviterProfile.id, 'and', currentUserProfile.id);
    
    // 1. Link the inviter to the current user
    const { error: updateInviterError } = await supabase
      .from('user_profiles')
      .update({ partner_id: currentUserId })
      .eq('id', partnerCode.inviter_id);
      
    if (updateInviterError) {
      console.error('Error updating inviter:', updateInviterError);
      throw updateInviterError;
    }
    
    // 2. Link the current user to the inviter
    const { error: updateCurrentUserError } = await supabase
      .from('user_profiles')
      .update({ partner_id: partnerCode.inviter_id })
      .eq('id', currentUserId);
      
    if (updateCurrentUserError) {
      console.error('Error updating current user:', updateCurrentUserError);
      throw updateCurrentUserError;
    }
    
    // 3. Mark the code as used
    const { error: updateCodeError } = await supabase
      .from('partner_codes')
      .update({ is_used: true })
      .eq('code', code.toUpperCase());
      
    if (updateCodeError) {
      console.error('Error updating code:', updateCodeError);
      throw updateCodeError;
    }
    
    console.log('Successfully connected users!');
    
    // If all operations succeeded, return success
    return { error: null };
  } catch (error) {
    console.error('Error redeeming partner code:', error);
    return { error };
  }
};
