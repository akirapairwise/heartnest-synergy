
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { PartnerInvitation } from '@/types/partners';
import * as partnerService from '@/services/partnerService';

export const usePartnerStatus = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [invitations, setInvitations] = useState<PartnerInvitation[]>([]);
  const [activeInvitation, setActiveInvitation] = useState<PartnerInvitation | null>(null);
  const { user, profile, fetchUserProfile } = useAuth();

  const fetchInvitations = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await partnerService.fetchUserInvitations(user.id);
        
      if (error) throw error;
      
      setInvitations(data || []);
      
      // Set the active invitation (most recent pending one)
      if (data && data.length > 0) {
        const pendingInvitation = data.find(inv => inv.status === 'pending');
        setActiveInvitation(pendingInvitation || null);
      } else {
        setActiveInvitation(null);
      }
    } catch (error) {
      console.error('Error fetching partner invitations:', error);
      toast.error('Failed to load invitations');
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  const sendInvitation = useCallback(async (recipientEmail: string) => {
    if (!user) {
      toast.error('You must be logged in to send invitations');
      return { error: new Error('Not authenticated') };
    }
    
    try {
      setIsLoading(true);
      
      const { data, error } = await partnerService.createInvitation(user.id, recipientEmail);
      
      if (error) {
        if (error.message === 'Duplicate invitation') {
          toast.error('You already have a pending invitation for this email');
        } else {
          throw error;
        }
        return { error };
      }
      
      // Refresh the invitations list
      await fetchInvitations();
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Error sending partner invitation:', error);
      toast.error('Failed to send invitation');
      return { error };
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchInvitations]);
  
  // Effect to fetch invitations on mount
  useEffect(() => {
    if (user) {
      fetchInvitations();
    }
  }, [user, fetchInvitations]);
  
  return {
    invitations,
    activeInvitation,
    isLoading,
    fetchInvitations,
    sendInvitation
  };
};
