
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Profile } from "@/types/auth";

export interface PartnerCode {
  code: string;
  inviter_id: string;
  is_used: boolean;
  created_at: string;
  expires_at: string;
}

export interface CodeResult {
  code: string | null;
  error: Error | null;
}

/**
 * Generates a new partner code for the current user
 */
export const generatePartnerCode = async (): Promise<CodeResult> => {
  try {
    // First delete any existing unused codes
    const { error: deleteError } = await supabase
      .from('partner_codes')
      .delete()
      .eq('inviter_id', supabase.auth.getSession().then(({ data }) => data.session?.user.id))
      .eq('is_used', false);
      
    if (deleteError) {
      console.error('Error deleting existing codes:', deleteError);
    }
    
    // Call the Postgres function to generate a unique code
    const { data, error } = await supabase
      .rpc('generate_partner_code');
      
    if (error) throw error;
    
    const generatedCode = data as string;
    
    // Insert the new code
    const { error: insertError } = await supabase
      .from('partner_codes')
      .insert({
        code: generatedCode,
        inviter_id: (await supabase.auth.getSession()).data.session?.user.id
      });
      
    if (insertError) throw insertError;
    
    return { code: generatedCode, error: null };
    
  } catch (error) {
    console.error('Error generating partner code:', error);
    return { code: null, error: error as Error };
  }
};

/**
 * Gets the user's active partner code, if any
 */
export const getActivePartnerCode = async (): Promise<CodeResult> => {
  try {
    const userId = (await supabase.auth.getSession()).data.session?.user.id;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('partner_codes')
      .select('*')
      .eq('inviter_id', userId)
      .eq('is_used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        // No record found
        return { code: null, error: null };
      }
      throw error;
    }
    
    return { code: data.code, error: null };
    
  } catch (error) {
    console.error('Error getting active partner code:', error);
    return { code: null, error: error as Error };
  }
};

/**
 * Ensures that a user profile exists, creating one if it doesn't
 */
export const ensureUserProfile = async (userId: string): Promise<Profile | null> => {
  try {
    // Try to fetch the profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (profileError) throw profileError;
    
    // If profile exists, return it
    if (profile) {
      return profile as unknown as Profile;
    }
    
    // Create a new profile
    const { data: newProfile, error: createError } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        is_onboarding_complete: false
      })
      .select()
      .single();
      
    if (createError) throw createError;
    
    return newProfile as unknown as Profile;
  } catch (error) {
    console.error('Error ensuring user profile exists:', error);
    return null;
  }
};

/**
 * Redeems a partner code, connecting the current user with the inviter
 */
export const redeemPartnerCode = async (code: string): Promise<{ success: boolean; message: string }> => {
  try {
    const userId = (await supabase.auth.getSession()).data.session?.user.id;
    
    if (!userId) {
      return { 
        success: false, 
        message: 'You must be logged in to redeem a partner code' 
      };
    }
    
    // Fetch the partner code
    const { data: partnerCode, error: codeError } = await supabase
      .from('partner_codes')
      .select('*')
      .eq('code', code)
      .eq('is_used', false)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
      
    if (codeError) throw codeError;
    
    if (!partnerCode) {
      return { 
        success: false, 
        message: 'Invalid or expired code' 
      };
    }
    
    // Prevent self-invitation
    if (partnerCode.inviter_id === userId) {
      return { 
        success: false, 
        message: 'You cannot connect with yourself' 
      };
    }
    
    // Ensure both user profiles exist
    const inviterProfile = await ensureUserProfile(partnerCode.inviter_id);
    const currentUserProfile = await ensureUserProfile(userId);
    
    if (!inviterProfile || !currentUserProfile) {
      return { 
        success: false, 
        message: 'Could not retrieve user profiles' 
      };
    }
    
    // Check if either user already has a partner
    if (inviterProfile.partner_id) {
      return {
        success: false,
        message: 'The inviter is already connected with a partner'
      };
    }
    
    if (currentUserProfile.partner_id) {
      return {
        success: false,
        message: 'You are already connected with a partner'
      };
    }
    
    // Update both profiles to establish the connection
    const { error: updateInviterError } = await supabase
      .from('user_profiles')
      .update({ partner_id: userId })
      .eq('id', partnerCode.inviter_id);
      
    if (updateInviterError) throw updateInviterError;
    
    const { error: updateCurrentUserError } = await supabase
      .from('user_profiles')
      .update({ partner_id: partnerCode.inviter_id })
      .eq('id', userId);
      
    if (updateCurrentUserError) throw updateCurrentUserError;
    
    // Mark the code as used
    const { error: updateCodeError } = await supabase
      .from('partner_codes')
      .update({ is_used: true })
      .eq('code', code);
      
    if (updateCodeError) throw updateCodeError;
    
    // Get inviter's name if available
    let inviterName = 'your partner';
    if (inviterProfile.full_name) {
      inviterName = inviterProfile.full_name;
    }
    
    return {
      success: true,
      message: `You are now connected with ${inviterName}!`
    };
    
  } catch (error) {
    console.error('Error redeeming partner code:', error);
    return { 
      success: false, 
      message: `An error occurred: ${(error as Error).message}` 
    };
  }
};
