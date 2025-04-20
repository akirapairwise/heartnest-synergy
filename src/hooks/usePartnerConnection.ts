
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
      const { data: result, error } = await supabase.rpc(
        'connect_partners_with_code',
        {
          invite_code: inviteCode.toUpperCase(),
          current_user_id: user.id
        }
      );

      if (error) {
        console.error('Error connecting partners:', error);
        toast.error('Failed to process invitation');
        return false;
      }

      switch (result) {
        case 'invalid_code':
          toast.error('Invalid or expired invitation code');
          return false;
        case 'self_invite':
          toast.error('You cannot connect with yourself');
          return false;
        case 'already_connected':
          toast.error('You are already connected with a partner');
          return false;
        case 'inviter_connected':
          toast.error('The inviter is already connected with someone else');
          return false;
        case 'success':
          if (fetchUserProfile) {
            await fetchUserProfile(user.id);
          }
          toast.success('🎉 You are now connected with your partner!');
          navigate('/dashboard');
          return true;
        default:
          toast.error('An unexpected error occurred');
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
