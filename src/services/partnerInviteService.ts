
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';

export interface PartnerInvite {
  id: string;
  inviter_id: string;
  token: string;
  is_accepted: boolean;
  created_at: string;
  inviter_name?: string; // Optional field for frontend display
}

/**
 * Creates a new partner invitation
 */
export const createInvitation = async (user: User): Promise<{ data: PartnerInvite | null, error: any }> => {
  try {
    // Check if user already has a partner
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('partner_id')
      .eq('id', user.id)
      .single();
      
    if (profileError) throw profileError;
    
    if (userProfile?.partner_id) {
      console.log('User already has a partner, cannot create invitation');
      return { 
        data: null, 
        error: new Error('You already have a partner. You must unlink your current partner before creating a new invitation.') 
      };
    }
    
    // Generate a random token
    const token = crypto.randomUUID().replace(/-/g, '').substring(0, 12);
    
    // Create a new invite
    const { data, error } = await supabase
      .from('partner_invites')
      .insert({
        inviter_id: user.id,
        token
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return { data: data as PartnerInvite, error: null };
  } catch (error) {
    console.error('Error creating partner invitation:', error);
    return { data: null, error };
  }
};

/**
 * Gets a partner invitation by token
 */
export const getInvitationByToken = async (token: string): Promise<{ data: PartnerInvite | null, error: any }> => {
  try {
    // Get the invitation data
    const { data: invite, error: inviteError } = await supabase
      .from('partner_invites')
      .select('*')
      .eq('token', token)
      .eq('is_accepted', false)
      .single();
      
    if (inviteError) throw inviteError;
    
    // If invite exists, get the inviter's name
    if (invite) {
      const { data: inviterProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('id', invite.inviter_id)
        .single();
        
      if (!profileError && inviterProfile) {
        // Add the inviter name to the response
        return { 
          data: { ...invite, inviter_name: inviterProfile.full_name } as PartnerInvite, 
          error: null 
        };
      }
      
      return { data: invite as PartnerInvite, error: null };
    }
    
    return { data: null, error: new Error('Invitation not found') };
  } catch (error) {
    console.error('Error fetching invitation:', error);
    return { data: null, error };
  }
};

/**
 * Gets all partner invitations for a user
 */
export const getUserInvitations = async (userId: string): Promise<{ data: PartnerInvite[] | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('partner_invites')
      .select('*')
      .eq('inviter_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return { data: data as PartnerInvite[], error: null };
  } catch (error) {
    console.error('Error fetching partner invitations:', error);
    return { data: null, error };
  }
};

/**
 * Accepts a partner invitation
 */
export const acceptInvitation = async (token: string, currentUserId: string): Promise<{ error: any }> => {
  try {
    console.log('Starting invitation acceptance process...');
    
    // First get the invitation
    const { data: invite, error: fetchError } = await getInvitationByToken(token);
    
    if (fetchError || !invite) {
      console.error('Failed to find invitation:', fetchError || 'Invitation not found');
      return { error: fetchError || new Error('Invitation not found or already accepted') };
    }
    
    // Check that user isn't inviting themselves
    if (invite.inviter_id === currentUserId) {
      console.error('User tried to accept their own invitation');
      return { error: new Error('You cannot accept your own invitation') };
    }
    
    // Check if either user already has a partner
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('id, partner_id, full_name')
      .in('id', [invite.inviter_id, currentUserId]);
      
    if (usersError) {
      console.error('Error checking user profiles:', usersError);
      throw usersError;
    }
    
    const inviterProfile = users?.find(u => u.id === invite.inviter_id);
    const currentUserProfile = users?.find(u => u.id === currentUserId);
    
    if (inviterProfile?.partner_id) {
      console.error('Inviter already has a partner:', inviterProfile.partner_id);
      return { error: new Error(`The inviter (${inviterProfile.full_name || 'User'}) already has a partner`) };
    }
    
    if (currentUserProfile?.partner_id) {
      console.error('Current user already has a partner:', currentUserProfile.partner_id);
      return { error: new Error('You already have a partner. Unlink your current partner before accepting a new invitation.') };
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
 * Unlinks partners
 */
export const unlinkPartner = async (userId: string, partnerId: string | null): Promise<{ error: any }> => {
  if (!partnerId) {
    return { error: null }; // Nothing to unlink
  }
  
  try {
    // Unlink the current user
    const { error: unlinkUserError } = await supabase
      .from('user_profiles')
      .update({ partner_id: null })
      .eq('id', userId);
      
    if (unlinkUserError) throw unlinkUserError;
    
    // Unlink the partner
    const { error: unlinkPartnerError } = await supabase
      .from('user_profiles')
      .update({ partner_id: null })
      .eq('id', partnerId);
      
    if (unlinkPartnerError) throw unlinkPartnerError;
    
    return { error: null };
  } catch (error) {
    console.error('Error unlinking partner:', error);
    return { error };
  }
};
