
import { useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import * as partnerService from '@/services/partners';
import { displayErrorToast } from './useInviteUtils';

interface UsePartnerUnlinkingProps {
  user: User | null;
  partnerId: string | null;
  fetchUserProfile: (userId: string) => Promise<void>;
}

interface UsePartnerUnlinkingReturn {
  isUnlinking: boolean;
  unlinkPartner: () => Promise<{ error: Error | null }>;
}

export const usePartnerUnlinking = ({ 
  user, 
  partnerId,
  fetchUserProfile 
}: UsePartnerUnlinkingProps): UsePartnerUnlinkingReturn => {
  const [isUnlinking, setIsUnlinking] = useState(false);
  
  const unlinkPartner = useCallback(async () => {
    if (!user || !partnerId) {
      toast.error('No partner to unlink');
      return { error: new Error('No partner to unlink') };
    }
    
    setIsUnlinking(true);
    try {
      const { error } = await partnerService.unlinkPartner(user.id, partnerId);
      
      if (error) throw error;
      
      // Refresh user profile
      await fetchUserProfile(user.id);
      
      return { error: null };
    } catch (error: any) {
      displayErrorToast(error, 'Error unlinking partner:');
      return { error };
    } finally {
      setIsUnlinking(false);
    }
  }, [user, partnerId, fetchUserProfile]);
  
  return {
    isUnlinking,
    unlinkPartner
  };
};
