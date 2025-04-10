
import { useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import * as partnerService from '@/services/partners';
import { generateInviteUrl, displayErrorToast } from './useInviteUtils';

interface UseInviteCreationProps {
  user: User | null;
  hasPartner: boolean;
}

interface UseInviteCreationReturn {
  isLoading: boolean;
  createInvitation: () => Promise<string | null>;
  regenerateToken: () => Promise<string | null>;
}

export const useInviteCreation = ({ user, hasPartner }: UseInviteCreationProps): UseInviteCreationReturn => {
  const [isLoading, setIsLoading] = useState(false);
  
  const createInvitation = useCallback(async () => {
    if (!user) {
      toast.error('You must be logged in to invite a partner');
      return null;
    }
    
    if (hasPartner) {
      toast.error('You already have a partner connected');
      return null;
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await partnerService.createInvitation(user);
      
      if (error) throw error;
      
      if (data) {
        const url = generateInviteUrl(data.token);
        console.log('Invitation created successfully:', data);
        return url;
      }
      return null;
    } catch (error) {
      displayErrorToast(error, 'Error creating invitation:');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, hasPartner]);
  
  const regenerateToken = useCallback(async () => {
    if (!user) {
      toast.error('You must be logged in to regenerate an invitation');
      return null;
    }
    
    if (hasPartner) {
      toast.error('You already have a partner connected');
      return null;
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await partnerService.regenerateToken(user.id);
      
      if (error) throw error;
      
      if (data) {
        const url = generateInviteUrl(data.token);
        toast.success('Invitation link regenerated successfully');
        return url;
      }
      return null;
    } catch (error) {
      displayErrorToast(error, 'Error regenerating token:');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, hasPartner]);
  
  return {
    isLoading,
    createInvitation,
    regenerateToken
  };
};
