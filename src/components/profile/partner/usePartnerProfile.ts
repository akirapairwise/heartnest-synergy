
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePartnerProfile = (partnerId: string | undefined | null) => {
  const [partnerProfile, setPartnerProfile] = useState<any>(null);
  
  const fetchPartnerProfile = useCallback(async () => {
    if (!partnerId) {
      setPartnerProfile(null);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', partnerId)
        .single();
        
      if (error) throw error;
      
      setPartnerProfile(data);
    } catch (error) {
      console.error('Error fetching partner profile:', error);
    }
  }, [partnerId]);
  
  return {
    partnerProfile,
    fetchPartnerProfile
  };
};
