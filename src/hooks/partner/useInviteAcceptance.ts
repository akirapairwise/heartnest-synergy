
import { useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import * as partnerService from '@/services/partners';
import { displayErrorToast } from './useInviteUtils';

interface UseInviteAcceptanceProps {
  user: User | null;
  fetchUserProfile: (userId: string) => Promise<void>;
}

interface UseInviteAcceptanceReturn {
  isAccepting: boolean;
  acceptInvitation: (token: string) => Promise<{ error: Error | null }>;
}

export const useInviteAcceptance = ({ 
  user, 
  fetchUserProfile 
}: UseInviteAcceptanceProps): UseInviteAcceptanceReturn => {
  const [isAccepting, setIsAccepting] = useState(false);
  
  const acceptInvitation = useCallback(async (token: string) => {
    if (!user) {
      toast.error('You must be logged in to accept an invitation');
      return { error: new Error('Not authenticated') };
    }
    
    setIsAccepting(true);
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
      setIsAccepting(false);
    }
  }, [user, fetchUserProfile]);
  
  return {
    isAccepting,
    acceptInvitation
  };
};
