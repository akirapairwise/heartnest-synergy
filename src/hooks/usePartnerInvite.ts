
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PartnerInvite } from '@/services/partners';
import { useInviteCreation } from './partner/useInviteCreation';
import { useInviteAcceptance } from './partner/useInviteAcceptance';
import { usePartnerUnlinking } from './partner/usePartnerUnlinking';
import { useInviteLoading } from './partner/useInviteLoading';

export const usePartnerInvite = () => {
  const { user, profile, fetchUserProfile } = useAuth();
  const hasPartner = Boolean(profile?.partner_id);
  
  // Combine the loading states
  const [isLoading, setIsLoading] = useState(false);
  
  // Use the specialized hooks
  const inviteCreation = useInviteCreation({
    user,
    hasPartner
  });
  
  const inviteAcceptance = useInviteAcceptance({
    user,
    fetchUserProfile
  });
  
  const partnerUnlinking = usePartnerUnlinking({
    user,
    partnerId: profile?.partner_id || null,
    fetchUserProfile
  });
  
  const inviteLoading = useInviteLoading({
    user,
    hasPartner
  });
  
  // Combine loading states from all hooks
  useEffect(() => {
    const loading = inviteCreation.isLoading || 
                    inviteAcceptance.isAccepting || 
                    partnerUnlinking.isUnlinking || 
                    inviteLoading.isLoading;
    setIsLoading(loading);
  }, [
    inviteCreation.isLoading,
    inviteAcceptance.isAccepting,
    partnerUnlinking.isUnlinking,
    inviteLoading.isLoading
  ]);
  
  // Load user invites on mount and when profile changes
  useEffect(() => {
    if (user) {
      inviteLoading.loadUserInvites();
    }
  }, [user, profile?.partner_id, inviteLoading.loadUserInvites]);
  
  return {
    isLoading,
    inviteUrl: inviteLoading.inviteUrl,
    activeInvite: inviteLoading.activeInvite,
    createInvitation: inviteCreation.createInvitation,
    acceptInvitation: inviteAcceptance.acceptInvitation,
    unlinkPartner: partnerUnlinking.unlinkPartner,
    regenerateToken: inviteCreation.regenerateToken,
    refreshInvites: inviteLoading.loadUserInvites
  };
};
