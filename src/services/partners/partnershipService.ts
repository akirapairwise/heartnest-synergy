
import { supabase } from "@/integrations/supabase/client";
import { OperationResult } from "./types";
import { getInvitationByToken } from "./invitationService";

/**
 * Accepts a partner invitation and connects both users
 */
export const acceptInvitation = async (token: string, currentUserId: string): Promise<OperationResult> => {
  try {
    console.log('⚠️ DEBUG: Starting invitation acceptance process...');
    console.log('⚠️ DEBUG: Current user ID:', currentUserId);
    
    // First get the invitation
    const { data: invite, error: fetchError } = await getInvitationByToken(token);
    
    if (fetchError || !invite) {
      console.error('⚠️ DEBUG: Failed to find invitation:', fetchError || 'Invitation not found');
      return { error: fetchError || new Error('Invitation not found, expired, or already accepted') };
    }
    
    console.log('⚠️ DEBUG: Invitation found:', {
      id: invite.id,
      inviter_id: invite.inviter_id,
      inviter_name: invite.inviter_name
    });
    
    // Check that user isn't inviting themselves
    if (invite.inviter_id === currentUserId) {
      console.error('⚠️ DEBUG: User tried to accept their own invitation');
      console.error('⚠️ DEBUG: Inviter ID:', invite.inviter_id);
      console.error('⚠️ DEBUG: Current user ID:', currentUserId);
      return { error: new Error('You cannot accept your own invitation') };
    }
    
    // Check if either user already has a partner
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('id, partner_id, full_name')
      .in('id', [invite.inviter_id, currentUserId]);
      
    if (usersError) {
      console.error('⚠️ DEBUG: Error checking user profiles:', usersError);
      throw usersError;
    }
    
    const inviterProfile = users?.find(u => u.id === invite.inviter_id);
    const currentUserProfile = users?.find(u => u.id === currentUserId);
    
    console.log('⚠️ DEBUG: Inviter profile:', inviterProfile);
    console.log('⚠️ DEBUG: Current user profile:', currentUserProfile);
    
    if (inviterProfile?.partner_id) {
      console.error('⚠️ DEBUG: Inviter already has a partner:', inviterProfile.partner_id);
      return { error: new Error(`The inviter (${inviterProfile.full_name || 'User'}) already has a partner`) };
    }
    
    if (currentUserProfile?.partner_id) {
      console.error('⚠️ DEBUG: Current user already has a partner:', currentUserProfile.partner_id);
      return { error: new Error('You already have a partner. Unlink your current partner before accepting a new invitation.') };
    }
    
    console.log('⚠️ DEBUG: Starting partner linking process...');
    
    // Update the invite status
    const { error: updateError } = await supabase
      .from('partner_invites')
      .update({ is_accepted: true })
      .eq('id', invite.id);
      
    if (updateError) {
      console.error('⚠️ DEBUG: Error updating invitation status:', updateError);
      throw updateError;
    }
    
    console.log('⚠️ DEBUG: Updated invitation status to accepted');
    
    // Link the inviter to the current user
    const { error: updateInviterError } = await supabase
      .from('user_profiles')
      .update({ partner_id: currentUserId })
      .eq('id', invite.inviter_id);
      
    if (updateInviterError) {
      console.error('⚠️ DEBUG: Error linking inviter to current user:', updateInviterError);
      throw updateInviterError;
    }
    
    console.log('⚠️ DEBUG: Linked inviter to current user');
    
    // Link the current user to the inviter
    const { error: updateCurrentUserError } = await supabase
      .from('user_profiles')
      .update({ partner_id: invite.inviter_id })
      .eq('id', currentUserId);
      
    if (updateCurrentUserError) {
      console.error('⚠️ DEBUG: Error linking current user to inviter:', updateCurrentUserError);
      throw updateCurrentUserError;
    }
    
    console.log('⚠️ DEBUG: Linked current user to inviter. Connection complete!');
    
    return { error: null };
  } catch (error) {
    console.error('⚠️ DEBUG: Error in acceptInvitation:', error);
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
