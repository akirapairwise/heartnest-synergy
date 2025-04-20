
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const usePartnerConnection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, fetchUserProfile } = useAuth();

  const connectWithPartner = async (inviteCode: string) => {
    if (!user) {
      toast.error('You must be logged in to connect');
      return false;
    }

    setIsLoading(true);

    try {
      // Call the Supabase function to process the invite
      const { data, error } = await supabase.rpc('process_partner_invite', {
        p_invite_code: inviteCode.toUpperCase(),
        p_current_user_id: user.id
      });

      if (error) {
        console.error('Partner connection error:', error);
        toast.error(error.message || 'Failed to connect with partner');
        return false;
      }

      if (data === 'success') {
        // Refresh user profile to get updated partner information
        if (fetchUserProfile) {
          await fetchUserProfile(user.id);
        }

        toast.success('🎉 You are now connected with your partner!');
        navigate('/dashboard');
        return true;
      } else {
        // Handle specific validation messages
        toast.error(data);
        return false;
      }
    } catch (err) {
      console.error('Unexpected partner connection error:', err);
      toast.error('An unexpected error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { connectWithPartner, isLoading };
};
