
import { supabase } from "@/integrations/supabase/client";
import { PartnerInvitation } from "@/types/partners";
import { toast } from 'sonner';

/**
 * Fetches all partner invitations for a user
 */
export const fetchUserInvitations = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('partner_invitations')
      .select('*')
      .eq('sender_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Explicitly cast the data to ensure type compatibility
    const typedData = data?.map(item => ({
      ...item,
      status: item.status as 'pending' | 'accepted' | 'rejected'
    })) as PartnerInvitation[] || [];
    
    return { data: typedData, error: null };
  } catch (error) {
    console.error('Error fetching partner invitations:', error);
    return { data: null, error };
  }
};

/**
 * Creates a new partner invitation
 */
export const createInvitation = async (userId: string, recipientEmail: string) => {
  try {
    // First check if there's already a pending invitation for this email
    const { data: existingInvites } = await supabase
      .from('partner_invitations')
      .select('id')
      .eq('sender_id', userId)
      .eq('recipient_email', recipientEmail)
      .eq('status', 'pending')
      .limit(1);
      
    if (existingInvites && existingInvites.length > 0) {
      return { 
        data: null, 
        error: new Error('Duplicate invitation') 
      };
    }
    
    // Create a new invitation - note we don't provide invitation_code as it's generated server-side
    const { data, error } = await supabase
      .from('partner_invitations')
      .insert({
        sender_id: userId,
        recipient_email: recipientEmail,
        status: 'pending'
      })
      .select('*')
      .single();
      
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error sending partner invitation:', error);
    return { data: null, error };
  }
};

/**
 * Gets an invitation by its code
 */
export const getInvitationByCode = async (invitationCode: string) => {
  try {
    const { data, error } = await supabase
      .from('partner_invitations')
      .select('*')
      .eq('invitation_code', invitationCode)
      .neq('status', 'accepted')
      .single();
      
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error getting invitation by code:', error);
    return { data: null, error };
  }
};

/**
 * Updates an invitation's status
 */
export const updateInvitationStatus = async (invitationId: string, status: 'accepted' | 'rejected') => {
  try {
    const updateData: any = { status };
    if (status === 'accepted') {
      updateData.accepted_at = new Date().toISOString();
    }
    
    const { error } = await supabase
      .from('partner_invitations')
      .update(updateData)
      .eq('id', invitationId);
      
    if (error) throw error;
    
    return { error: null };
  } catch (error) {
    console.error(`Error updating invitation to ${status}:`, error);
    return { error };
  }
};

/**
 * Updates a user's partner connection
 */
export const updateUserPartner = async (userId: string, partnerId: string | null) => {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({ partner_id: partnerId })
      .eq('id', userId);
      
    if (error) throw error;
    
    return { error: null };
  } catch (error) {
    console.error('Error updating user partner:', error);
    return { error };
  }
};
