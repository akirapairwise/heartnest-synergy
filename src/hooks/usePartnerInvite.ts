
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { ensureUserProfile } from '@/services/partnerCodeService';

export interface PartnerInvite {
  id: string;
  inviter_id: string;
  token: string;
  is_accepted: boolean;
  expires_at: string;
  created_at: string;
}

export const usePartnerInvite = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [activeInvite, setActiveInvite] = useState<PartnerInvite | null>(null);
  const { user, fetchUserProfile } = useAuth();

  // Function to fetch the current active invitation
  const fetchActiveInvite = useCallback(async () => {
    if (!user) return null;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Ensure profile exists first
      await ensureUserProfile(user.id);
      
      const { data, error } = await supabase
        .from('partner_invites')
        .select('*')
        .eq('inviter_id', user.id)
        .eq('is_accepted', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching active invite:', error);
        setError(error);
        return null;
      }
      
      return data as PartnerInvite | null;
    } catch (err) {
      console.error('Unexpected error fetching active invite:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch active invitation'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Function to refresh active invites - this is the method we're adding
  const refreshInvites = useCallback(async () => {
    if (!user) return;
    
    try {
      const invite = await fetchActiveInvite();
      if (invite) {
        setActiveInvite(invite);
        setInviteUrl(generateInviteUrl(invite.token));
      } else {
        setActiveInvite(null);
        setInviteUrl(null);
      }
    } catch (err) {
      console.error('Error refreshing invites:', err);
    }
  }, [user, fetchActiveInvite]);

  // Function to create an invitation
  const createInvitation = async (): Promise<string | null> => {
    if (!user) {
      toast.error('You must be logged in to create an invitation');
      return null;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // First ensure user profile exists
      const profile = await ensureUserProfile(user.id);
      if (!profile) {
        throw new Error('Could not create or retrieve your profile');
      }
      
      // Check if user already has a partner
      if (profile.partner_id) {
        toast.error('You already have a partner connected');
        return null;
      }
      
      // Check for existing active invitation
      const existingInvite = await fetchActiveInvite();
      
      if (existingInvite) {
        // Use the existing invitation
        setActiveInvite(existingInvite);
        const url = generateInviteUrl(existingInvite.token);
        setInviteUrl(url);
        return url;
      }
      
      // Create a new token (random string)
      const token = generateToken();
      
      // Set expiration date (7 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      // Insert new invitation
      const { data, error } = await supabase
        .from('partner_invites')
        .insert({
          inviter_id: user.id,
          token,
          expires_at: expiresAt.toISOString(),
          is_accepted: false
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating invitation:', error);
        throw error;
      }
      
      const newInvite = data as PartnerInvite;
      setActiveInvite(newInvite);
      
      const url = generateInviteUrl(token);
      setInviteUrl(url);
      
      return url;
    } catch (err) {
      console.error('Error creating invitation:', err);
      setError(err instanceof Error ? err : new Error('Failed to create invitation'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to regenerate a new token
  const regenerateToken = async (): Promise<string | null> => {
    if (!user) {
      toast.error('You must be logged in to create an invitation');
      return null;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Delete any existing invitations
      await supabase
        .from('partner_invites')
        .delete()
        .eq('inviter_id', user.id)
        .eq('is_accepted', false);
      
      // Create a new token
      return await createInvitation();
    } catch (err) {
      console.error('Error regenerating token:', err);
      setError(err instanceof Error ? err : new Error('Failed to regenerate invitation'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Accept an invitation (for the invitee)
  const acceptInvitation = async (token: string) => {
    if (!user) {
      toast.error('You must be logged in to accept an invitation');
      return { error: new Error('Authentication required') };
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Ensure user profile exists first
      const currentUserProfile = await ensureUserProfile(user.id);
      if (!currentUserProfile) {
        throw new Error('Could not create or retrieve your profile');
      }
      
      // Check if user already has a partner
      if (currentUserProfile.partner_id) {
        return { error: new Error('You already have a partner connected') };
      }
      
      // Validate the token
      const { data: invite, error: tokenError } = await supabase
        .from('partner_invites')
        .select('*')
        .eq('token', token)
        .eq('is_accepted', false)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();
      
      if (tokenError) {
        console.error('Error validating token:', tokenError);
        throw tokenError;
      }
      
      if (!invite) {
        return { error: new Error('This invitation is invalid, expired, or has already been used') };
      }
      
      // Check if the user is trying to accept their own invitation
      if (invite.inviter_id === user.id) {
        return { error: new Error('You cannot accept your own invitation') };
      }
      
      // Ensure inviter's profile exists
      const inviterProfile = await ensureUserProfile(invite.inviter_id);
      if (!inviterProfile) {
        throw new Error('Could not retrieve the inviter\'s profile');
      }
      
      // Check if inviter already has a partner
      if (inviterProfile.partner_id) {
        return { error: new Error('The inviter already has a partner') };
      }
      
      // Update invitation status
      const { error: updateInviteError } = await supabase
        .from('partner_invites')
        .update({ is_accepted: true })
        .eq('id', invite.id);
        
      if (updateInviteError) {
        console.error('Error updating invitation status:', updateInviteError);
        throw updateInviteError;
      }
      
      // Link the users as partners
      // 1. Update inviter's profile
      const { error: updateInviterError } = await supabase
        .from('user_profiles')
        .update({ partner_id: user.id })
        .eq('id', invite.inviter_id);
        
      if (updateInviterError) {
        console.error('Error updating inviter profile:', updateInviterError);
        throw updateInviterError;
      }
      
      // 2. Update current user's profile
      const { error: updateUserError } = await supabase
        .from('user_profiles')
        .update({ partner_id: invite.inviter_id })
        .eq('id', user.id);
        
      if (updateUserError) {
        console.error('Error updating user profile:', updateUserError);
        throw updateUserError;
      }
      
      // Refresh user profile
      if (fetchUserProfile) {
        await fetchUserProfile(user.id);
      }
      
      return { error: null };
    } catch (err) {
      console.error('Error accepting invitation:', err);
      return { error: err instanceof Error ? err : new Error('Failed to accept invitation') };
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch active invitation on mount
  useEffect(() => {
    const loadInvite = async () => {
      if (user) {
        const invite = await fetchActiveInvite();
        if (invite) {
          setActiveInvite(invite);
          setInviteUrl(generateInviteUrl(invite.token));
        }
      }
    };
    
    loadInvite();
  }, [user, fetchActiveInvite]);

  // Helper function to generate a token
  const generateToken = () => {
    return Array.from(
      { length: 12 },
      () => Math.floor(Math.random() * 36).toString(36)
    ).join('').toUpperCase();
  };

  // Helper function to generate the invite URL
  const generateInviteUrl = (token: string) => {
    return `${window.location.origin}/invite?token=${token}`;
  };

  return {
    isLoading,
    error,
    inviteUrl,
    activeInvite,
    createInvitation,
    regenerateToken,
    acceptInvitation,
    refreshInvites  // Add the new method to the returned object
  };
};

export default usePartnerInvite;
