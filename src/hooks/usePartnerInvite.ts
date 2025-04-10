
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import * as partnerService from '@/services/partners';
import { PartnerInvite } from '@/services/partners';

export const usePartnerInvite = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [activeInvite, setActiveInvite] = useState<PartnerInvite | null>(null);
  
  const { user, profile, fetchUserProfile } = useAuth();
  
  const createInvitation = useCallback(async () => {
    if (!user) {
      toast.error('You must be logged in to invite a partner');
      return null;
    }
    
    if (profile?.partner_id) {
      toast.error('You already have a partner connected');
      return null;
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await partnerService.createInvitation(user);
      
      if (error) throw error;
      
      if (data) {
        // Create the full invitation URL
        const baseUrl = window.location.origin;
        const url = `${baseUrl}/invite?token=${data.token}`;
        setInviteUrl(url);
        setActiveInvite(data);
        console.log('Invitation created successfully:', data);
        return url;
      }
      return null;
    } catch (error) {
      console.error('Error creating invitation:', error);
      toast.error('Failed to create invitation');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, profile]);
  
  const acceptInvitation = useCallback(async (token: string) => {
    if (!user) {
      toast.error('You must be logged in to accept an invitation');
      return { error: new Error('Not authenticated') };
    }
    
    setIsLoading(true);
    try {
      console.log('Accepting invitation with token:', token);
      const { error } = await partnerService.acceptInvitation(token, user.id);
      
      if (error) {
        console.error('Error from acceptInvitation service:', error);
        throw error;
      }
      
      console.log('Successfully accepted invitation, refreshing profile...');
      
      // Refresh user profile to get updated partner_id
      await fetchUserProfile(user.id);
      
      return { error: null };
    } catch (error: any) {
      console.error('Error in acceptInvitation hook:', error);
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
      const { error } = await partnerService.unlinkPartner(user.id, profile.partner_id);
      
      if (error) throw error;
      
      // Refresh user profile
      await fetchUserProfile(user.id);
      
      // Clear any active invites
      setActiveInvite(null);
      setInviteUrl(null);
      
      return { error: null };
    } catch (error: any) {
      console.error('Error unlinking partner:', error);
      toast.error('Failed to break partner connection');
      return { error };
    } finally {
      setIsLoading(false);
    }
  }, [user, profile, fetchUserProfile]);
  
  const loadUserInvites = useCallback(async () => {
    if (!user) return;
    
    // Don't load invites if user already has a partner
    if (profile?.partner_id) {
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
        const baseUrl = window.location.origin;
        const url = `${baseUrl}/invite?token=${latestInvite.token}`;
        setInviteUrl(url);
        console.log('Found existing invitation:', latestInvite);
      } else {
        console.log('No active invitations found');
        setActiveInvite(null);
        setInviteUrl(null);
      }
    } catch (error) {
      console.error('Error loading invitations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, profile]);
  
  /**
   * Regenerates the token for an existing invitation
   */
  const regenerateToken = useCallback(async () => {
    if (!user) {
      toast.error('You must be logged in to regenerate an invitation');
      return null;
    }
    
    if (!activeInvite) {
      toast.error('No active invitation to regenerate');
      return null;
    }
    
    if (profile?.partner_id) {
      toast.error('You already have a partner connected');
      return null;
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await partnerService.regenerateToken(user.id);
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Create the full invitation URL
        const baseUrl = window.location.origin;
        const url = `${baseUrl}/invite?token=${data.token}`;
        setInviteUrl(url);
        setActiveInvite(data);
        toast.success('Invitation link regenerated successfully');
        return url;
      }
      return null;
    } catch (error: any) {
      console.error('Error regenerating token:', error);
      toast.error(error.message || 'Failed to regenerate invitation');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, activeInvite, profile]);
  
  // Load user invites on mount and when profile changes
  useEffect(() => {
    if (user) {
      loadUserInvites();
    }
  }, [user, profile?.partner_id, loadUserInvites]);
  
  return {
    isLoading,
    inviteUrl,
    activeInvite,
    createInvitation,
    acceptInvitation,
    unlinkPartner,
    regenerateToken,
    refreshInvites: loadUserInvites
  };
};
