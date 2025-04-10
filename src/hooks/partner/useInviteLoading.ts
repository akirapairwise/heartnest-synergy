
import { useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import * as partnerService from '@/services/partners';
import { PartnerInvite } from '@/services/partners';
import { generateInviteUrl, displayErrorToast } from './useInviteUtils';

interface UseInviteLoadingProps {
  user: User | null;
  hasPartner: boolean;
}

interface UseInviteLoadingReturn {
  isLoading: boolean;
  activeInvite: PartnerInvite | null;
  inviteUrl: string | null;
  loadUserInvites: () => Promise<void>;
}

export const useInviteLoading = ({ 
  user, 
  hasPartner 
}: UseInviteLoadingProps): UseInviteLoadingReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeInvite, setActiveInvite] = useState<PartnerInvite | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  
  const loadUserInvites = useCallback(async () => {
    if (!user) return;
    
    // Don't load invites if user already has a partner
    if (hasPartner) {
      setActiveInvite(null);
      setInviteUrl(null);
      return;
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await partnerService.getUserInvitations(user.id);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Find the most recent active invite
        const latestInvite = data[0]; // Should already be filtered by expiration and acceptance
        setActiveInvite(latestInvite);
        
        // Create the invite URL
        const url = generateInviteUrl(latestInvite.token);
        setInviteUrl(url);
        console.log('Found existing invitation:', latestInvite);
      } else {
        console.log('No active invitations found');
        setActiveInvite(null);
        setInviteUrl(null);
      }
    } catch (error) {
      displayErrorToast(error, 'Error loading invitations:');
    } finally {
      setIsLoading(false);
    }
  }, [user, hasPartner]);
  
  return {
    isLoading,
    activeInvite,
    inviteUrl,
    loadUserInvites
  };
};
