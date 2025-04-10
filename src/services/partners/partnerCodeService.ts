
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
      
    if (codeError) throw codeError;
    
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
    
    // Check if users already have partners
    console.log('Looking up user profiles for:', partnerCode.inviter_id, 'and', currentUserId);
    
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('id, partner_id, full_name')
      .in('id', [partnerCode.inviter_id, currentUserId]);
      
    if (usersError) {
      console.error('Error fetching user profiles:', usersError);
      throw usersError;
    }
    
    console.log('User profiles found:', users);
    
    if (!users || users.length < 2) {
      console.error('Could not find both user profiles:', {
        expected: [partnerCode.inviter_id, currentUserId],
        found: users
      });
      return { error: new Error('Could not find both user profiles. Please try again or contact support.') };
    }
    
    const inviter = users.find(u => u.id === partnerCode.inviter_id);
    const currentUser = users.find(u => u.id === currentUserId);
    
    if (!inviter) {
      console.error('Code owner profile not found:', partnerCode.inviter_id);
      return { error: new Error('Could not find the code owner\'s profile.') };
    }
    
    if (!currentUser) {
      console.error('Current user profile not found:', currentUserId);
      return { error: new Error('Could not find your user profile.') };
    }
    
    if (inviter.partner_id) {
      return { error: new Error('The code owner already has a partner.') };
    }
    
    if (currentUser.partner_id) {
      return { error: new Error('You already have a partner. Disconnect first before connecting to someone else.') };
    }
    
    // Start transaction to link both users
    console.log('Linking users:', inviter.id, 'and', currentUser.id);
    
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
