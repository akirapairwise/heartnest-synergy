
import { usePartnerStatus } from './usePartnerStatus';
import { usePartnerConnection } from './usePartnerConnection';

export const usePartnerInvitations = () => {
  const { 
    invitations, 
    activeInvitation, 
    isLoading: invitationsLoading, 
    fetchInvitations, 
    sendInvitation 
  } = usePartnerStatus();
  
  const { 
    isLoading: connectionLoading, 
    acceptInvitation, 
    unlinkPartner 
  } = usePartnerConnection();
  
  const isLoading = invitationsLoading || connectionLoading;
  
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
