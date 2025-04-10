
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
}

/**
 * Generates a new partner code for the current user
 */
export const generatePartnerCode = async (): Promise<CodeResult> => {
  try {
    // First delete any existing unused codes
    const userId = (await supabase.auth.getSession()).data.session?.user.id;
    
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
    const userId = (await supabase.auth.getSession()).data.session?.user.id;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    // Ensure user profile exists
    await ensureUserProfile(userId);
    
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
    
    const partnerCode = data as unknown as PartnerCode;
    return { code: partnerCode.code, error: null };
    
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
      throw profileError;
    }
    
    // If profile exists, return it
    if (profile) {
      console.log('Found existing profile:', profile);
      return profile as unknown as Profile;
    }
    
    console.log('No profile found, creating new one for user:', userId);
    
    // Create a new profile with default values
    const defaultProfile = {
      id: userId,
      is_onboarding_complete: false,
      partner_id: null,
      full_name: null,
      love_language: null,
      communication_style: null,
      emotional_needs: null,
      relationship_goals: null,
      financial_attitude: null,
      location: null,
      bio: null,
      mood_settings: {
        showAvatar: true,
        defaultMood: 'neutral'
      }
    };
    
    const { data: newProfile, error: createError } = await supabase
      .from('user_profiles')
      .insert(defaultProfile)
      .select()
      .single();
      
    if (createError) {
      console.error('Error creating new user profile:', createError);
      throw createError;
    }
    
    console.log('Created new profile successfully:', newProfile);
    return newProfile as unknown as Profile;
  } catch (error) {
    console.error('Error ensuring user profile exists:', error);
    toast.error('Could not create or retrieve user profile');
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
    const userId = session.session?.user.id;
    
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
    
    console.log('Ensuring both user profiles exist...');
    // Ensure both user profiles exist
    const inviterProfile = await ensureUserProfile(partnerCode.inviter_id);
    const currentUserProfile = await ensureUserProfile(userId);
    
    if (!inviterProfile) {
      console.error('Could not ensure inviter profile exists');
      return { 
        success: false, 
        message: 'Could not retrieve inviter profile. Please try again or contact support.' 
      };
    }
    
    if (!currentUserProfile) {
      console.error('Could not ensure current user profile exists');
      return { 
        success: false, 
        message: 'Could not set up your profile. Please try again or contact support.' 
      };
    }
    
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
      throw updateInviterError;
    }
    
    const { error: updateCurrentUserError } = await supabase
      .from('user_profiles')
      .update({ partner_id: partnerCode.inviter_id })
      .eq('id', userId);
      
    if (updateCurrentUserError) {
      console.error('Error updating current user profile:', updateCurrentUserError);
      throw updateCurrentUserError;
    }
    
    console.log('Successfully connected users, marking code as used...');
    // Mark the code as used
    const { error: updateCodeError } = await supabase
      .from('partner_codes')
      .update({ is_used: true } as unknown as Partial<PartnerCode>)
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
