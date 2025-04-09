
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import * as partnerInviteService from '@/services/partnerInviteService';

export const usePartnerInvite = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [activeInvite, setActiveInvite] = useState<partnerInviteService.PartnerInvite | null>(null);
  
  const { user, profile, fetchUserProfile } = useAuth();
  
  const createInvitation = useCallback(async () => {
    if (!user) {
      toast.error('You must be logged in to invite a partner');
      return;
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await partnerInviteService.createInvitation(user);
      
      if (error) throw error;
      
      if (data) {
        // Create the full invitation URL
        const baseUrl = window.location.origin;
        const url = `${baseUrl}/invite?token=${data.token}`;
        setInviteUrl(url);
        setActiveInvite(data);
        return url;
      }
    } catch (error) {
      console.error('Error creating invitation:', error);
      toast.error('Failed to create invitation');
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  const acceptInvitation = useCallback(async (token: string) => {
    if (!user) {
      toast.error('You must be logged in to accept an invitation');
      return { error: new Error('Not authenticated') };
    }
    
    setIsLoading(true);
    try {
      console.log('Accepting invitation with token:', token);
      const { error } = await partnerInviteService.acceptInvitation(token, user.id);
      
      if (error) {
        console.error('Error from acceptInvitation service:', error);
        throw error;
      }
      
      console.log('Successfully accepted invitation, refreshing profile...');
      
      // Refresh user profile to get updated partner_id
      await fetchUserProfile(user.id);
      
      toast.success('Partner connected successfully!');
      return { error: null };
    } catch (error: any) {
      console.error('Error in acceptInvitation hook:', error);
      toast.error(error.message || 'Failed to accept invitation');
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
    
    setIsLoading(true);
    try {
      const { error } = await partnerInviteService.unlinkPartner(user.id, profile.partner_id);
      
      if (error) throw error;
      
      // Refresh user profile
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
  
  const loadUserInvites = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await partnerInviteService.getUserInvitations(user.id);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Find the most recent active invite
        const latestInvite = data.find(invite => !invite.is_accepted);
        if (latestInvite) {
          setActiveInvite(latestInvite);
          
          // Create the invite URL
          const baseUrl = window.location.origin;
          const url = `${baseUrl}/invite?token=${latestInvite.token}`;
          setInviteUrl(url);
        } else {
          setActiveInvite(null);
          setInviteUrl(null);
        }
      } else {
        setActiveInvite(null);
        setInviteUrl(null);
      }
    } catch (error) {
      console.error('Error loading invitations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  // Load user invites on mount
  useEffect(() => {
    if (user) {
      loadUserInvites();
    }
  }, [user, loadUserInvites]);
  
  return {
    isLoading,
    inviteUrl,
    activeInvite,
    createInvitation,
    acceptInvitation,
    unlinkPartner,
    refreshInvites: loadUserInvites
  };
};
