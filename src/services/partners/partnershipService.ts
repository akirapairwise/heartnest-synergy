
import { supabase } from "@/integrations/supabase/client";
import { OperationResult } from "./types";
import { getInvitationByToken } from "../partnerInviteService";

/**
 * Accepts a partner invitation and connects both users
 */
export const acceptInvitation = async (token: string, currentUserId: string): Promise<OperationResult> => {
  try {
    console.log('Starting invitation acceptance process...');
    console.log('Current user ID:', currentUserId);
    console.log('Token:', token);
    
    // First get the invitation with enhanced validation
    const { data: invite, error: fetchError } = await getInvitationByToken(token);
    
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
      .select('id')
      .eq('id', currentUserId);
      
    if (userProfileError) {
      console.error('Error checking user profile existence:', userProfileError);
      return { error: new Error('Error validating your account. Please try again.') };
    }
    
    if (!userProfileCheck || userProfileCheck.length === 0) {
      console.log('Creating profile for current user:', currentUserId);
      // Try to create a profile for the current user
      const { error: createError } = await supabase
        .from('user_profiles')
        .insert([{ id: currentUserId }]);
        
      if (createError) {
        console.error('Error creating user profile:', createError);
        return { error: new Error('Could not create user profile. Please try again.') };
      }
    }
    
    // Check if the current user's profile exists
    const { data: currentUserProfile, error: currentUserError } = await supabase
      .from('user_profiles')
      .select('id, partner_id, full_name')
      .eq('id', currentUserId)
      .maybeSingle();
      
    if (currentUserError || !currentUserProfile) {
      console.error('Error fetching current user profile:', currentUserError || 'Profile not found');
      return { error: new Error('Your profile could not be found. Please try again later.') };
    }
    
    console.log('Found current user profile:', currentUserProfile);
    
    // Check if the current user already has a partner
    if (currentUserProfile.partner_id) {
      console.error('Current user already has a partner:', currentUserProfile.partner_id);
      return { error: new Error('You already have a partner. Unlink your current partner before accepting a new invitation.') };
    }
    
    // Ensure inviter exists in user_profiles
    const { data: inviterProfileCheck, error: inviterProfileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', invite.inviter_id);
      
    if (inviterProfileError) {
      console.error('Error checking inviter profile existence:', inviterProfileError);
      return { error: new Error('Error validating the inviter account. Please try again.') };
    }
    
    if (!inviterProfileCheck || inviterProfileCheck.length === 0) {
      console.log('Creating profile for inviter:', invite.inviter_id);
      // Try to create a profile for the inviter
      const { error: createError } = await supabase
        .from('user_profiles')
        .insert([{ id: invite.inviter_id }]);
        
      if (createError) {
        console.error('Error creating inviter profile:', createError);
        return { error: new Error('Could not create inviter profile. Please try again.') };
      }
    }
    
    // Check if the inviter's profile exists
    const { data: inviterProfile, error: inviterError } = await supabase
      .from('user_profiles')
      .select('id, partner_id, full_name')
      .eq('id', invite.inviter_id)
      .maybeSingle();
      
    if (inviterError || !inviterProfile) {
      console.error('Error fetching inviter profile:', inviterError || 'Profile not found');
      return { error: new Error('The inviter no longer has an account or their profile could not be found.') };
    }
    
    console.log('Found inviter profile:', inviterProfile);
    
    // Check if the inviter already has a partner
    if (inviterProfile.partner_id) {
      console.error('Inviter already has a partner:', inviterProfile.partner_id);
      return { error: new Error(`${inviterProfile.full_name || 'The inviter'} already has a partner.`) };
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
