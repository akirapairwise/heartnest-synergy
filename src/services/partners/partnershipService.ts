
import { supabase } from "@/integrations/supabase/client";
import { OperationResult } from "./types";
import { getInvitationByToken } from "../partnerInviteService";
import { formatToken } from "@/hooks/partner-invites/utils";

/**
 * Accepts a partner invitation and connects both users
 */
export const acceptInvitation = async (token: string, currentUserId: string): Promise<OperationResult> => {
  try {
    console.log('Starting invitation acceptance process...');
    console.log('Current user ID:', currentUserId);
    console.log('Token:', formatToken(token));
    
    // Format token to be consistent
    const formattedToken = formatToken(token);
    
    // First get the invitation with enhanced validation
    const { data: invite, error: fetchError } = await getInvitationByToken(formattedToken);
    
    if (fetchError || !invite) {
      console.error('Failed to find invitation:', fetchError || 'Invitation not found');
      return { error: fetchError || new Error('Invitation not found, expired, or already accepted') };
    }
    
    console.log('Found invitation:', invite);
    
    // Check that user isn't inviting themselves
    if (invite.inviter_id === currentUserId) {
      console.error('User tried to accept their own invitation');
      return { error: new Error('You cannot accept your own invitation') };
    }
    
    // Ensure current user exists in user_profiles
    const { data: userProfileCheck, error: userProfileError } = await supabase
      .from('user_profiles')
      .select('id, partner_id')
      .eq('id', currentUserId)
      .maybeSingle();
      
    if (userProfileError) {
      console.error('Error checking user profile existence:', userProfileError);
    }
    
    if (!userProfileCheck) {
      console.log('Creating profile for current user:', currentUserId);
      // Try to create a profile for the current user
      const { error: createError } = await supabase
        .from('user_profiles')
        .insert([{ id: currentUserId }]);
        
      if (createError) {
        console.error('Error creating user profile:', createError);
        return { error: new Error('Could not create user profile. Please try again.') };
      }
      
      // Verify profile was created
      const { data: newProfile, error: checkError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', currentUserId)
        .maybeSingle();
        
      if (checkError || !newProfile) {
        console.error('Failed to verify profile creation:', checkError);
        return { error: new Error('Profile creation could not be verified. Please try again.') };
      }
    } else if (userProfileCheck.partner_id) {
      // Check if the current user already has a partner
      console.error('Current user already has a partner:', userProfileCheck.partner_id);
      return { error: new Error('You already have a partner. Unlink your current partner before accepting a new invitation.') };
    }
    
    // Ensure inviter exists in user_profiles
    const { data: inviterProfileCheck, error: inviterProfileError } = await supabase
      .from('user_profiles')
      .select('id, partner_id')
      .eq('id', invite.inviter_id)
      .maybeSingle();
      
    if (inviterProfileError) {
      console.error('Error checking inviter profile existence:', inviterProfileError);
    }
    
    if (!inviterProfileCheck) {
      console.log('Creating profile for inviter:', invite.inviter_id);
      // Try to create a profile for the inviter
      const { error: createError } = await supabase
        .from('user_profiles')
        .insert([{ id: invite.inviter_id }]);
        
      if (createError) {
        console.error('Error creating inviter profile:', createError);
        return { error: new Error('Could not create inviter profile. Please try again.') };
      }
      
      // Verify profile was created
      const { data: newProfile, error: checkError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', invite.inviter_id)
        .maybeSingle();
        
      if (checkError || !newProfile) {
        console.error('Failed to verify inviter profile creation:', checkError);
        return { error: new Error('Inviter profile creation could not be verified. Please try again.') };
      }
    } else if (inviterProfileCheck.partner_id) {
      // Check if the inviter already has a partner
      console.error('Inviter already has a partner:', inviterProfileCheck.partner_id);
      return { error: new Error('The inviter already has a partner.') };
    }
    
    console.log('Starting partner linking process...');
    
    // Update the invite status
    const { error: updateError } = await supabase
      .from('partner_invites')
      .update({ is_accepted: true })
      .eq('id', invite.id);
      
    if (updateError) {
      console.error('Error updating invitation status:', updateError);
      throw updateError;
    }
    
    console.log('Updated invitation status to accepted');
    
    // Link the inviter to the current user
    const { error: updateInviterError } = await supabase
      .from('user_profiles')
      .update({ partner_id: currentUserId })
      .eq('id', invite.inviter_id);
      
    if (updateInviterError) {
      console.error('Error linking inviter to current user:', updateInviterError);
      throw updateInviterError;
    }
    
    console.log('Linked inviter to current user');
    
    // Link the current user to the inviter
    const { error: updateCurrentUserError } = await supabase
      .from('user_profiles')
      .update({ partner_id: invite.inviter_id })
      .eq('id', currentUserId);
      
    if (updateCurrentUserError) {
      console.error('Error linking current user to inviter:', updateCurrentUserError);
      throw updateCurrentUserError;
    }
    
    console.log('Linked current user to inviter. Connection complete!');
    
    return { error: null };
  } catch (error) {
    console.error('Error in acceptInvitation:', error);
    return { error };
  }
};

/**
 * Unlinks two partners and updates related resources
 */
export const unlinkPartner = async (userId: string, partnerId: string | null): Promise<OperationResult> => {
  if (!partnerId) {
    return { error: null }; // Nothing to unlink
  }
  
  try {
    console.log('Starting partner unlinking process...');
    
    // Begin a transaction for consistent updates
    // First, update shared resources
    
    // 1. Update shared goals to no longer be shared
    const { error: updateGoalsError } = await supabase
      .from('goals')
      .update({ 
        is_shared: false,
        partner_id: null 
      })
      .eq('owner_id', userId)
      .eq('partner_id', partnerId);
      
    if (updateGoalsError) {
      console.error('Error updating goals:', updateGoalsError);
      // Non-critical error, continue with the unlinking
    }
    
    // 2. Also update goals where the current user is the partner
    const { error: updatePartnerGoalsError } = await supabase
      .from('goals')
      .update({ 
        is_shared: false,
        partner_id: null 
      })
      .eq('owner_id', partnerId)
      .eq('partner_id', userId);
      
    if (updatePartnerGoalsError) {
      console.error('Error updating partner goals:', updatePartnerGoalsError);
      // Non-critical error, continue
    }
    
    // 3. Unlink the current user
    const { error: unlinkUserError } = await supabase
      .from('user_profiles')
      .update({ partner_id: null })
      .eq('id', userId);
      
    if (unlinkUserError) {
      console.error('Error unlinking user:', unlinkUserError);
      throw unlinkUserError;
    }
    
    // 4. Unlink the partner
    const { error: unlinkPartnerError } = await supabase
      .from('user_profiles')
      .update({ partner_id: null })
      .eq('id', partnerId);
      
    if (unlinkPartnerError) {
      console.error('Error unlinking partner:', unlinkPartnerError);
      throw unlinkPartnerError;
    }
    
    console.log('Partner connection successfully broken');
    
    return { error: null };
  } catch (error) {
    console.error('Error unlinking partner:', error);
    return { error };
  }
};
