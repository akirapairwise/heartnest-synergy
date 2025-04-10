
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Profile } from "@/types/auth";

// Define interfaces for the partner_codes table
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
  inviterId?: string | null; // Added to help with debugging
}

/**
 * Generates a new partner code for the current user
 */
export const generatePartnerCode = async (): Promise<CodeResult> => {
  try {
    // First delete any existing unused codes
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user.id;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    // Ensure user profile exists before generating code
    const profile = await ensureUserProfile(userId);
    if (!profile) {
      throw new Error('Could not create or retrieve user profile');
    }
    
    // Delete existing unused codes
    await supabase
      .from('partner_codes')
      .delete()
      .eq('inviter_id', userId)
      .eq('is_used', false);
    
    // Call the Postgres function to generate a unique code
    const { data: generatedCode, error: rpcError } = await supabase
      .rpc('generate_partner_code');
      
    if (rpcError) throw rpcError;
    
    // Insert the new code
    const { error: insertError } = await supabase
      .from('partner_codes')
      .insert({
        code: generatedCode as string,
        inviter_id: userId
      } as unknown as PartnerCode);
      
    if (insertError) throw insertError;
    
    return { code: generatedCode as string, error: null };
    
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
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user.id;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    // We'll skip profile creation here as it might not be necessary just to get a code
    
    const { data, error } = await supabase
      .from('partner_codes')
      .select('*')
      .eq('inviter_id', userId)
      .eq('is_used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
      
    if (error) {
      if (error.code === 'PGRST116') {
        // No record found
        return { code: null, error: null };
      }
      throw error;
    }
    
    const partnerCode = data as unknown as PartnerCode;
    return { 
      code: partnerCode?.code || null, 
      error: null,
      inviterId: partnerCode?.inviter_id || null 
    };
    
  } catch (error) {
    console.error('Error getting active partner code:', error);
    return { code: null, error: error as Error };
  }
};

/**
 * Ensures that a user profile exists, but doesn't try to create one if RLS policies might prevent it
 */
export const ensureUserProfile = async (userId: string): Promise<Profile | null> => {
  try {
    console.log('Ensuring user profile exists for user:', userId);
    
    if (!userId) {
      console.error('Invalid user ID provided to ensureUserProfile');
      return null;
    }
    
    // Try to fetch the profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      
      // If this is an RLS error, we'll return null without trying to create
      if (profileError.code === '42501') {
        console.log('RLS policy preventing profile access');
        return null;
      }
      
      throw profileError;
    }
    
    // If profile exists, return it
    if (profile) {
      console.log('Found existing profile:', profile);
      return profile as unknown as Profile;
    }
    
    console.log('No profile found for user:', userId);
    
    // We won't try to create a profile here if it doesn't exist,
    // as RLS policies might prevent it. Instead, we'll use the AuthContext
    // to handle profile creation.
    
    return null;
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
    console.log('Attempting to redeem partner code:', code);
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user.id;
    
    if (!userId) {
      console.error('No authenticated user found');
      return { 
        success: false, 
        message: 'You must be logged in to redeem a partner code' 
      };
    }
    
    // Fetch the partner code
    const { data: partnerCodeData, error: codeError } = await supabase
      .from('partner_codes')
      .select('*')
      .eq('code', code)
      .eq('is_used', false)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
      
    if (codeError) {
      console.error('Error fetching partner code:', codeError);
      
      // Return more specific message if it's an RLS error
      if (codeError.code === '42501') {
        return { 
          success: false, 
          message: 'Unable to access partner codes due to permission restrictions' 
        };
      }
      
      throw codeError;
    }
    
    if (!partnerCodeData) {
      console.error('Invalid or expired code:', code);
      return { 
        success: false, 
        message: 'Invalid or expired code' 
      };
    }
    
    const partnerCode = partnerCodeData as unknown as PartnerCode;
    
    // Prevent self-invitation
    if (partnerCode.inviter_id === userId) {
      console.error('User attempted to connect with themselves');
      return { 
        success: false, 
        message: 'You cannot connect with yourself' 
      };
    }
    
    // Check if the current user's profile exists
    const { data: currentUserProfileData, error: currentUserProfileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (currentUserProfileError) {
      console.error('Error checking current user profile:', currentUserProfileError);
      
      // Return more specific message if it's an RLS error
      if (currentUserProfileError.code === '42501') {
        return { 
          success: false, 
          message: 'Unable to access your profile due to permission restrictions' 
        };
      }
      
      return { 
        success: false, 
        message: 'Error checking your profile. Please try again later.' 
      };
    }
    
    if (!currentUserProfileData) {
      console.error('Current user profile not found');
      return { 
        success: false, 
        message: 'Your profile is not set up properly. Please try again later.' 
      };
    }
    
    const currentUserProfile = currentUserProfileData as unknown as Profile;
    
    // Check if the inviter exists as a user in the auth system first
    console.log('Checking if inviter exists in auth users:', partnerCode.inviter_id);
    const { data: authUserData, error: authUserError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', partnerCode.inviter_id)
      .maybeSingle();
      
    if (authUserError) {
      console.error('Error checking if inviter exists in auth users:', authUserError);
      return { 
        success: false, 
        message: 'Error checking if inviter exists. Please try again later.' 
      };
    }
    
    if (!authUserData) {
      console.error('Inviter does not exist in auth users:', partnerCode.inviter_id);
      return { 
        success: false, 
        message: 'The inviter no longer has an account. Please use a different code.' 
      };
    }
    
    // Check if the inviter's profile exists
    console.log('Checking inviter profile for user ID:', partnerCode.inviter_id);
    const { data: inviterProfileData, error: inviterProfileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', partnerCode.inviter_id)
      .maybeSingle();
      
    if (inviterProfileError) {
      console.error('Error checking inviter profile:', inviterProfileError);
      
      // Return more specific message if it's an RLS error
      if (inviterProfileError.code === '42501') {
        return { 
          success: false, 
          message: 'Unable to access inviter profile due to permission restrictions' 
        };
      }
      
      return { 
        success: false, 
        message: 'Error checking inviter profile. Please try again later.' 
      };
    }
    
    if (!inviterProfileData) {
      console.error('Inviter profile not found for ID:', partnerCode.inviter_id);
      return { 
        success: false, 
        message: 'The inviter profile does not exist. The code may have been generated by a user who has since deleted their account.' 
      };
    }
    
    const inviterProfile = inviterProfileData as unknown as Profile;
    
    console.log('Found both profiles:', {
      inviterProfile: inviterProfile.id,
      currentUserProfile: currentUserProfile.id
    });
    
    // Check if either user already has a partner
    if (inviterProfile.partner_id) {
      console.error('Inviter already has a partner:', inviterProfile.partner_id);
      return {
        success: false,
        message: 'The inviter is already connected with a partner'
      };
    }
    
    if (currentUserProfile.partner_id) {
      console.error('Current user already has a partner:', currentUserProfile.partner_id);
      return {
        success: false,
        message: 'You are already connected with a partner'
      };
    }
    
    console.log('Updating both profiles to establish connection...');
    // Update both profiles to establish the connection
    const { error: updateInviterError } = await supabase
      .from('user_profiles')
      .update({ partner_id: userId })
      .eq('id', partnerCode.inviter_id);
      
    if (updateInviterError) {
      console.error('Error updating inviter profile:', updateInviterError);
      
      // Return more specific message if it's an RLS error
      if (updateInviterError.code === '42501') {
        return { 
          success: false, 
          message: 'Unable to update inviter profile due to permission restrictions' 
        };
      }
      
      throw updateInviterError;
    }
    
    const { error: updateCurrentUserError } = await supabase
      .from('user_profiles')
      .update({ partner_id: partnerCode.inviter_id })
      .eq('id', userId);
      
    if (updateCurrentUserError) {
      console.error('Error updating current user profile:', updateCurrentUserError);
      
      // Return more specific message if it's an RLS error
      if (updateCurrentUserError.code === '42501') {
        return { 
          success: false, 
          message: 'Unable to update your profile due to permission restrictions' 
        };
      }
      
      throw updateCurrentUserError;
    }
    
    console.log('Successfully connected users, marking code as used...');
    // Mark the code as used
    const { error: updateCodeError } = await supabase
      .from('partner_codes')
      .update({ is_used: true })
      .eq('code', code);
      
    if (updateCodeError) {
      console.error('Error marking code as used:', updateCodeError);
      throw updateCodeError;
    }
    
    // Get inviter's name if available
    let inviterName = 'your partner';
    if (inviterProfile.full_name) {
      inviterName = inviterProfile.full_name;
    }
    
    console.log('Successfully completed partner connection!');
    return {
      success: true,
      message: `You are now connected with ${inviterName}!`
    };
    
  } catch (error) {
    console.error('Error redeeming partner code:', error);
    return { 
      success: false, 
      message: `An error occurred while connecting partners. Please try again later.` 
    };
  }
};
