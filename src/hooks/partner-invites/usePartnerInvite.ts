
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { PartnerInvite } from './types';
import { generateToken, generateInviteUrl } from './utils';
import { 
  fetchActiveInvite, 
  createNewInvitation, 
  acceptInvite, 
  regenerateInvitation 
} from './api';

export const usePartnerInvite = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [activeInvite, setActiveInvite] = useState<PartnerInvite | null>(null);
  const { user, fetchUserProfile } = useAuth();

  // Function to refresh active invites
  const refreshInvites = useCallback(async () => {
    if (!user) return;
    
    try {
      const invite = await fetchActiveInvite(user.id);
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
  }, [user]);

  // Function to create an invitation
  const createInvitation = async (): Promise<string | null> => {
    if (!user) {
      toast.error('You must be logged in to create an invitation');
      return null;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Check for existing active invitation
      const existingInvite = await fetchActiveInvite(user.id);
      
      if (existingInvite) {
        // Use the existing invitation
        setActiveInvite(existingInvite);
        const url = generateInviteUrl(existingInvite.token);
        setInviteUrl(url);
        return url;
      }
      
      // Create a new token
      const token = generateToken();
      
      // Create new invitation
      const result = await createNewInvitation(user.id, token);
      
      if (!result.success || !result.invite) {
        if (result.error) {
          setError(result.error);
          toast.error(result.error.message);
        }
        return null;
      }
      
      setActiveInvite(result.invite);
      const url = generateInviteUrl(token);
      setInviteUrl(url);
      
      return url;
    } catch (err) {
      console.error('Error creating invitation:', err);
      const errorObj = err instanceof Error ? err : new Error('Failed to create invitation');
      setError(errorObj);
      toast.error(errorObj.message);
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
      
      // Create a new token
      const token = generateToken();
      
      // Regenerate invitation
      const result = await regenerateInvitation(user.id, token);
      
      if (!result.success || !result.invite) {
        if (result.error) {
          setError(result.error);
          toast.error(result.error.message);
        }
        return null;
      }
      
      setActiveInvite(result.invite);
      const url = generateInviteUrl(token);
      setInviteUrl(url);
      
      return url;
    } catch (err) {
      console.error('Error regenerating token:', err);
      const errorObj = err instanceof Error ? err : new Error('Failed to regenerate invitation');
      setError(errorObj);
      toast.error(errorObj.message);
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
      
      const result = await acceptInvite(user.id, token);
      
      if (result.error) {
        setError(result.error);
        return result;
      }
      
      // Refresh user profile
      if (fetchUserProfile) {
        await fetchUserProfile(user.id);
      }
      
      return { error: null };
    } catch (err) {
      console.error('Error accepting invitation:', err);
      const errorObj = err instanceof Error ? err : new Error('Failed to accept invitation');
      setError(errorObj);
      return { error: errorObj };
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch active invitation on mount
  useEffect(() => {
    const loadInvite = async () => {
      if (user) {
        try {
          const invite = await fetchActiveInvite(user.id);
          if (invite) {
            setActiveInvite(invite);
            setInviteUrl(generateInviteUrl(invite.token));
          }
        } catch (err) {
          console.error('Error loading active invite:', err);
        }
      }
    };
    
    loadInvite();
  }, [user]);

  return {
    isLoading,
    error,
    inviteUrl,
    activeInvite,
    createInvitation,
    regenerateToken,
    acceptInvitation,
    refreshInvites
  };
};

export default usePartnerInvite;
