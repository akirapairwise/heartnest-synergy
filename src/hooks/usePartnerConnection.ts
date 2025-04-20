
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
      // Use the existing partner code service directly rather than RPC
      const { data, error } = await supabase
        .from('partner_codes')
        .select('*')
        .eq('code', inviteCode.toUpperCase())
        .eq('is_used', false)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (error) {
        console.error('Error fetching partner code:', error);
        toast.error('Failed to validate invitation code');
        return false;
      }

      if (!data) {
        toast.error('Invalid or expired invitation code');
        return false;
      }

      // Check if it's the user's own code
      if (data.inviter_id === user.id) {
        toast.error('You cannot connect with yourself');
        return false;
      }

      // Link the partners
      const { error: linkError } = await supabase.rpc('link_partners', {
        user_id_1: user.id, 
        user_id_2: data.inviter_id
      });

      if (linkError) {
        console.error('Error connecting partners:', linkError);
        toast.error('Failed to connect with partner');
        return false;
      }

      // Mark the code as used
      await supabase
        .from('partner_codes')
        .update({ is_used: true })
        .eq('code', inviteCode.toUpperCase());

      // Refresh user profile to get updated partner information
      if (fetchUserProfile) {
        await fetchUserProfile(user.id);
      }

      toast.success('🎉 You are now connected with your partner!');
      navigate('/dashboard');
      return true;
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
