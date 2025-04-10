
import { supabase } from "@/integrations/supabase/client";
import { OperationResult } from "./types";
import { PartnerCode, PartnerCodeInsert } from "@/types/partnerCodes";
import { toast } from 'sonner';

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
 * Redeems a partner code to connect two users
 */
export const redeemPartnerCode = async (currentUserId: string, code: string): Promise<OperationResult> => {
  try {
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
    
    // Retrieve both user profiles separately to ensure we get results
    // 1. First, get the inviter's profile
    const { data: inviterProfile, error: inviterError } = await supabase
      .from('user_profiles')
      .select('id, partner_id, full_name')
      .eq('id', partnerCode.inviter_id)
      .maybeSingle();
      
    if (inviterError) {
      console.error('Error fetching inviter profile:', inviterError);
      return { error: new Error('Unable to complete invitation. Try again or contact support.') };
    }
    
    if (!inviterProfile) {
      console.error('Inviter profile not found:', partnerCode.inviter_id);
      return { error: new Error('Unable to complete invitation. Try again or contact support.') };
    }
    
    // 2. Get the current user's profile
    const { data: currentUserProfile, error: userError } = await supabase
      .from('user_profiles')
      .select('id, partner_id, full_name')
      .eq('id', currentUserId)
      .maybeSingle();
      
    if (userError) {
      console.error('Error fetching current user profile:', userError);
      return { error: new Error('Unable to complete invitation. Try again or contact support.') };
    }
    
    if (!currentUserProfile) {
      console.error('Current user profile not found:', currentUserId);
      return { error: new Error('Unable to complete invitation. Try again or contact support.') };
    }
    
    console.log('Found profiles:', { 
      inviter: inviterProfile,
      currentUser: currentUserProfile
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
