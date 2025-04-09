
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import * as partnerService from '@/services/partnerService';

export const usePartnerConnection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user, profile, fetchUserProfile } = useAuth();
  
  const acceptInvitation = useCallback(async (invitationCode: string) => {
    if (!user) {
      toast.error('You must be logged in to accept invitations');
      return { error: new Error('Not authenticated') };
    }
    
    try {
      setIsLoading(true);
      
      // Get the invitation details
      const { data: invitation, error: fetchError } = await partnerService.getInvitationByCode(invitationCode);
        
      if (fetchError) throw fetchError;
      
      if (!invitation) {
        toast.error('Invalid invitation code or invitation already accepted');
        return { error: new Error('Invalid invitation') };
      }
      
      // Update the invitation status
      const { error: updateError } = await partnerService.updateInvitationStatus(invitation.id, 'accepted');
        
      if (updateError) throw updateError;
      
      // Link the two users as partners
      const { error: updateSenderError } = await partnerService.updateUserPartner(invitation.sender_id, user.id);
        
      if (updateSenderError) throw updateSenderError;
      
      const { error: updateRecipientError } = await partnerService.updateUserPartner(user.id, invitation.sender_id);
        
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
      const { error: updateCurrentError } = await partnerService.updateUserPartner(user.id, null);
        
      if (updateCurrentError) throw updateCurrentError;
      
      // Unlink partner from current user
      const { error: updatePartnerError } = await partnerService.updateUserPartner(profile.partner_id, null);
        
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
  
  return {
    isLoading,
    acceptInvitation,
    unlinkPartner
  };
};
