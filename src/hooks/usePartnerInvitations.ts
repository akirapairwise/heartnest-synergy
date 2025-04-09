
import { useState, useCallback, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { PartnerInvitation } from '@/types/partners';

export const usePartnerInvitations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [invitations, setInvitations] = useState<PartnerInvitation[]>([]);
  const [activeInvitation, setActiveInvitation] = useState<PartnerInvitation | null>(null);
  const { user, profile, fetchUserProfile } = useAuth();

  const fetchInvitations = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // We need to use any here because the tables aren't in the type definition yet
      const { data, error } = await supabase
        .from('partner_invitations')
        .select('*')
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false }) as any;
        
      if (error) throw error;
      
      setInvitations(data || []);
      
      // Set the active invitation (most recent pending one)
      if (data && data.length > 0) {
        const pendingInvitation = data.find((inv: PartnerInvitation) => inv.status === 'pending');
        setActiveInvitation(pendingInvitation || null);
      } else {
        setActiveInvitation(null);
      }
    } catch (error) {
      console.error('Error fetching partner invitations:', error);
      toast.error('Failed to load invitations');
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  const sendInvitation = useCallback(async (recipientEmail: string) => {
    if (!user) {
      toast.error('You must be logged in to send invitations');
      return { error: new Error('Not authenticated') };
    }
    
    try {
      setIsLoading(true);
      
      // First check if there's already a pending invitation for this email
      const { data: existingInvites } = await supabase
        .from('partner_invitations')
        .select('id')
        .eq('sender_id', user.id)
        .eq('recipient_email', recipientEmail)
        .eq('status', 'pending')
        .limit(1) as any;
        
      if (existingInvites && existingInvites.length > 0) {
        toast.error('You already have a pending invitation for this email');
        return { error: new Error('Duplicate invitation') };
      }
      
      // Create a new invitation
      const { data, error } = await supabase
        .from('partner_invitations')
        .insert([
          { 
            sender_id: user.id,
            recipient_email: recipientEmail
          }
        ])
        .select('*')
        .single() as any;
        
      if (error) throw error;
      
      // Refresh the invitations list
      await fetchInvitations();
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Error sending partner invitation:', error);
      toast.error('Failed to send invitation');
      return { error };
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchInvitations]);
  
  const acceptInvitation = useCallback(async (invitationCode: string) => {
    if (!user) {
      toast.error('You must be logged in to accept invitations');
      return { error: new Error('Not authenticated') };
    }
    
    try {
      setIsLoading(true);
      
      // Get the invitation details
      const { data: invitation, error: fetchError } = await supabase
        .from('partner_invitations')
        .select('*')
        .eq('invitation_code', invitationCode)
        .neq('status', 'accepted')
        .single() as any;
        
      if (fetchError) throw fetchError;
      
      if (!invitation) {
        toast.error('Invalid invitation code or invitation already accepted');
        return { error: new Error('Invalid invitation') };
      }
      
      // Update the invitation status
      const { error: updateError } = await supabase
        .from('partner_invitations')
        .update({ 
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', invitation.id) as any;
        
      if (updateError) throw updateError;
      
      // Link the two users as partners
      const { error: updateSenderError } = await supabase
        .from('user_profiles')
        .update({ partner_id: user.id })
        .eq('id', invitation.sender_id) as any;
        
      if (updateSenderError) throw updateSenderError;
      
      const { error: updateRecipientError } = await supabase
        .from('user_profiles')
        .update({ partner_id: invitation.sender_id })
        .eq('id', user.id) as any;
        
      if (updateRecipientError) throw updateRecipientError;
      
      // Refresh the user profile to get the updated partner_id
      await fetchUserProfile(user.id);
      
      toast.success('Partner connected successfully!');
      return { data: invitation, error: null };
    } catch (error: any) {
      console.error('Error accepting partner invitation:', error);
      toast.error('Failed to accept invitation');
      return { error };
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchUserProfile]);
  
  const unlinkPartner = useCallback(async () => {
    if (!user || !profile?.partner_id) {
      toast.error('No partner to unlink');
      return { error: new Error('No partner to unlink') };
    }
    
    try {
      setIsLoading(true);
      
      // Unlink current user from partner
      const { error: updateCurrentError } = await supabase
        .from('user_profiles')
        .update({ partner_id: null } as any)
        .eq('id', user.id);
        
      if (updateCurrentError) throw updateCurrentError;
      
      // Unlink partner from current user
      const { error: updatePartnerError } = await supabase
        .from('user_profiles')
        .update({ partner_id: null } as any)
        .eq('id', profile.partner_id);
        
      if (updatePartnerError) throw updatePartnerError;
      
      // Refresh the user profile
      await fetchUserProfile(user.id);
      
      toast.success('Partner unlinked successfully');
      return { error: null };
    } catch (error: any) {
      console.error('Error unlinking partner:', error);
      toast.error('Failed to unlink partner');
      return { error };
    } finally {
      setIsLoading(false);
    }
  }, [user, profile, fetchUserProfile]);
  
  // Effect to fetch invitations on mount
  useEffect(() => {
    if (user) {
      fetchInvitations();
    }
  }, [user, fetchInvitations]);
  
  return {
    invitations,
    activeInvitation,
    isLoading,
    fetchInvitations,
    sendInvitation,
    acceptInvitation,
    unlinkPartner
  };
};
