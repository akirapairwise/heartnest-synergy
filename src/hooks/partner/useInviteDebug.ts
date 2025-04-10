
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PartnerCode } from '@/types/partnerCodes';

export const useInviteDebug = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [debugResults, setDebugResults] = useState<any>(null);
  
  const checkUserPartnerStatus = async (userId: string) => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, partner_id, full_name')
        .eq('id', userId)
        .single();
        
      if (profileError) throw profileError;
      
      // Get active invitations
      const { data: invites, error: invitesError } = await supabase
        .from('partner_invites')
        .select('*')
        .eq('inviter_id', userId)
        .eq('is_accepted', false);
        
      if (invitesError) throw invitesError;
      
      // This is a workaround since the type definitions don't include partner_codes yet
      // Get partner codes
      const { data: codes, error: codesError } = await supabase
        .from('partner_codes')
        .select('*')
        .eq('inviter_id', userId) as { data: PartnerCode[] | null, error: any };
        
      if (codesError) throw codesError;
      
      setDebugResults({
        profile,
        activeInvitations: invites,
        partnerCodes: codes,
        partnerStatus: profile?.partner_id ? 'Connected' : 'Not connected'
      });
    } catch (error) {
      console.error('Error checking user partner status:', error);
      setDebugResults({ error });
    } finally {
      setIsLoading(false);
    }
  };
  
  const checkTokenStatus = async (token: string) => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      // Check in partner_invites
      const { data: invite, error: inviteError } = await supabase
        .from('partner_invites')
        .select('*')
        .eq('token', token)
        .maybeSingle();
        
      if (inviteError) throw inviteError;
      
      // Check in partner_codes - casting needed due to type issue
      const { data: code, error: codeError } = await supabase
        .from('partner_codes')
        .select('*')
        .eq('code', token.toUpperCase())
        .maybeSingle() as { data: PartnerCode | null, error: any };
        
      if (codeError) throw codeError;
      
      setDebugResults({
        invite,
        code,
        foundIn: invite ? 'partner_invites' : code ? 'partner_codes' : 'not found',
        status: code?.is_used ? 'Used' : invite?.is_accepted ? 'Accepted' : 'Active'
      });
    } catch (error) {
      console.error('Error checking token status:', error);
      setDebugResults({ error });
    } finally {
      setIsLoading(false);
    }
  };
  
  const checkPartnerConnection = async (userId1: string, userId2: string) => {
    if (!userId1 || !userId2) return;
    
    setIsLoading(true);
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, partner_id, full_name')
        .in('id', [userId1, userId2]);
        
      if (profilesError) throw profilesError;
      
      const user1 = profiles?.find(p => p.id === userId1);
      const user2 = profiles?.find(p => p.id === userId2);
      
      const isUser1ConnectedToUser2 = user1?.partner_id === userId2;
      const isUser2ConnectedToUser1 = user2?.partner_id === userId1;
      
      setDebugResults({
        user1,
        user2,
        isUser1ConnectedToUser2,
        isUser2ConnectedToUser1,
        isConnectionComplete: isUser1ConnectedToUser2 && isUser2ConnectedToUser1,
        connectionStatus: isUser1ConnectedToUser2 && isUser2ConnectedToUser1 
          ? 'Complete' 
          : isUser1ConnectedToUser2 || isUser2ConnectedToUser1
            ? 'Partial'
            : 'None'
      });
    } catch (error) {
      console.error('Error checking partner connection:', error);
      setDebugResults({ error });
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
