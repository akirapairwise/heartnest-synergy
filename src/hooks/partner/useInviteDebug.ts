
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

export const useInviteDebug = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [debugResults, setDebugResults] = useState<any>(null);
  
  const checkUserPartnerStatus = async (userId: string) => {
    if (!userId) {
      toast.error('Please provide a valid user ID');
      return;
    }
    
    setIsLoading(true);
    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, full_name, partner_id')
        .eq('id', userId)
        .single();
        
      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        toast.error('Error fetching user profile');
        return;
      }
      
      // Get partner profile if exists
      let partnerProfile = null;
      if (profile?.partner_id) {
        const { data: partner, error: partnerError } = await supabase
          .from('user_profiles')
          .select('id, full_name')
          .eq('id', profile.partner_id)
          .single();
          
        if (!partnerError) {
          partnerProfile = partner;
        }
      }
      
      // Check for active invitations from this user
      const { data: sentInvites, error: invitesError } = await supabase
        .from('partner_invites')
        .select('*')
        .eq('inviter_id', userId)
        .order('created_at', { ascending: false });
        
      if (invitesError) {
        console.error('Error fetching sent invitations:', invitesError);
      }
      
      // Check for invitations where this user is one of the users trying to connect
      const { data: allInvites, error: allInvitesError } = await supabase
        .from('partner_invites')
        .select('*')
        .or(`inviter_id.eq.${userId}`)
        .order('created_at', { ascending: false });
      
      const results = {
        userProfile: profile,
        partnerProfile,
        hasPartner: Boolean(profile?.partner_id),
        activeInvitations: sentInvites?.filter(inv => !inv.is_accepted && new Date(inv.expires_at) > new Date()) || [],
        expiredInvitations: sentInvites?.filter(inv => !inv.is_accepted && new Date(inv.expires_at) <= new Date()) || [],
        acceptedInvitations: sentInvites?.filter(inv => inv.is_accepted) || [],
        allInvites: allInvites || []
      };
      
      setDebugResults(results);
      console.log('User partner status:', results);
      toast.success('Partner status checked successfully');
      
      return results;
    } catch (error) {
      console.error('Error checking partner status:', error);
      toast.error('Error checking partner status');
    } finally {
      setIsLoading(false);
    }
  };
  
  const checkTokenStatus = async (token: string) => {
    if (!token) {
      toast.error('Please provide a valid token');
      return;
    }
    
    setIsLoading(true);
    try {
      // Get invite by token (regardless of accepted status or expiration)
      const { data: invite, error: inviteError } = await supabase
        .from('partner_invites')
        .select('*')
        .eq('token', token)
        .maybeSingle();
        
      if (inviteError) {
        console.error('Error fetching invitation by token:', inviteError);
        toast.error('Error fetching invitation');
        return;
      }
      
      if (!invite) {
        console.log('No invitation found with this token');
        toast.error('No invitation found with this token');
        setDebugResults({
          tokenExists: false,
          invite: null,
          isExpired: false,
          isAccepted: false,
          inviter: null,
          message: 'Token does not exist in the database'
        });
        return;
      }
      
      // Get inviter info
      const { data: inviter, error: inviterError } = await supabase
        .from('user_profiles')
        .select('id, full_name, partner_id')
        .eq('id', invite.inviter_id)
        .single();
        
      if (inviterError) {
        console.error('Error fetching inviter profile:', inviterError);
      }
      
      const now = new Date();
      const expiresAt = new Date(invite.expires_at);
      const isExpired = expiresAt < now;
      
      const results = {
        tokenExists: true,
        invite,
        isExpired,
        isAccepted: invite.is_accepted,
        expiresAt: expiresAt.toISOString(),
        timeUntilExpiration: isExpired ? 'Expired' : `${Math.round((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60))} hours`,
        inviter: inviter || null,
        inviterHasPartner: Boolean(inviter?.partner_id),
        message: invite.is_accepted 
          ? 'Invitation has already been accepted' 
          : isExpired 
            ? 'Invitation has expired' 
            : 'Invitation is valid'
      };
      
      setDebugResults(results);
      console.log('Token status:', results);
      
      if (invite.is_accepted) {
        toast.error('This invitation has already been accepted');
      } else if (isExpired) {
        toast.error('This invitation has expired');
      } else {
        toast.success('Invitation is valid');
      }
      
      return results;
    } catch (error) {
      console.error('Error checking token status:', error);
      toast.error('Error checking token status');
    } finally {
      setIsLoading(false);
    }
  };
  
  const checkPartnerConnection = async (userId1: string, userId2: string) => {
    if (!userId1 || !userId2) {
      toast.error('Please provide valid user IDs');
      return;
    }
    
    setIsLoading(true);
    try {
      // Get both user profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, full_name, partner_id')
        .in('id', [userId1, userId2]);
        
      if (profilesError) {
        console.error('Error fetching user profiles:', profilesError);
        toast.error('Error fetching user profiles');
        return;
      }
      
      if (!profiles || profiles.length < 2) {
        toast.error('One or both user profiles not found');
        return;
      }
      
      const user1 = profiles.find(p => p.id === userId1);
      const user2 = profiles.find(p => p.id === userId2);
      
      const results = {
        user1,
        user2,
        user1HasPartner: Boolean(user1?.partner_id),
        user2HasPartner: Boolean(user2?.partner_id),
        arePartnered: user1?.partner_id === userId2 && user2?.partner_id === userId1,
        correctPartnership: user1?.partner_id === userId2 && user2?.partner_id === userId1,
        oneWayPartnership: 
          (user1?.partner_id === userId2 && user2?.partner_id !== userId1) || 
          (user1?.partner_id !== userId2 && user2?.partner_id === userId1),
        message: ''
      };
      
      if (results.arePartnered) {
        results.message = 'Users are correctly partnered';
        toast.success('Users are correctly partnered');
      } else if (results.oneWayPartnership) {
        results.message = 'One-way partnership detected (database inconsistency)';
        toast.error('One-way partnership detected. Database inconsistency!');
      } else if (user1?.partner_id && user2?.partner_id) {
        results.message = 'Both users have different partners';
        toast.error('Both users have different partners');
      } else if (user1?.partner_id) {
        results.message = `User 1 (${user1.full_name}) already has a partner`;
        toast.error(`User 1 (${user1.full_name}) already has a partner`);
      } else if (user2?.partner_id) {
        results.message = `User 2 (${user2.full_name}) already has a partner`;
        toast.error(`User 2 (${user2.full_name}) already has a partner`);
      } else {
        results.message = 'Users are not partnered and are available to connect';
        toast.info('Users are not partnered and are available to connect');
      }
      
      setDebugResults(results);
      console.log('Partner connection status:', results);
      
      return results;
    } catch (error) {
      console.error('Error checking partner connection:', error);
      toast.error('Error checking partner connection');
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    debugResults,
    checkUserPartnerStatus,
    checkTokenStatus,
    checkPartnerConnection
  };
};
