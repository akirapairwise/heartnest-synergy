
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { usePartnerInvite } from '@/hooks/usePartnerInvite';

// Import the component parts
import ConnectedPartner from './partner/ConnectedPartner';
import ActiveInvite from './partner/ActiveInvite';
import CreateInvitation from './partner/CreateInvitation';
import UnlinkDialog from './partner/UnlinkDialog';

const PartnerSettings = () => {
  const { profile, user } = useAuth();
  const [isUnlinkDialogOpen, setIsUnlinkDialogOpen] = useState(false);
  const [partnerProfile, setPartnerProfile] = useState<any>(null);
  
  const {
    isLoading,
    inviteUrl,
    activeInvite,
    createInvitation,
    unlinkPartner,
    refreshInvites,
    regenerateToken
  } = usePartnerInvite();
  
  const hasPartner = Boolean(profile?.partner_id);
  
  useEffect(() => {
    if (user) {
      refreshInvites();
      fetchPartnerProfile();
    }
  }, [user, profile?.partner_id, refreshInvites]);
  
  const fetchPartnerProfile = async () => {
    if (!profile?.partner_id) return;
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', profile.partner_id)
        .single();
        
      if (error) throw error;
      
      setPartnerProfile(data);
    } catch (error) {
      console.error('Error fetching partner profile:', error);
    }
  };
  
  const handleCreateInvite = async () => {
    await createInvitation();
  };
  
  const handleUnlinkPartner = async () => {
    const { error } = await unlinkPartner();
    
    if (!error) {
      setIsUnlinkDialogOpen(false);
      setPartnerProfile(null);
      toast.success('Partner connection broken successfully');
    }
  };
  
  const handleRegenerateToken = async () => {
    await regenerateToken();
  };
  
  return (
    <div className="space-y-4">
      {hasPartner ? (
        <ConnectedPartner 
          partnerProfile={partnerProfile}
          onUnlink={() => setIsUnlinkDialogOpen(true)}
        />
      ) : activeInvite ? (
        <ActiveInvite 
          inviteUrl={inviteUrl}
          activeInvite={activeInvite}
          onRegenerateToken={handleRegenerateToken}
          isLoading={isLoading}
        />
      ) : (
        <CreateInvitation 
          onCreateInvite={handleCreateInvite}
          isLoading={isLoading}
        />
      )}
      
      <UnlinkDialog 
        isOpen={isUnlinkDialogOpen}
        onOpenChange={setIsUnlinkDialogOpen}
        onConfirm={handleUnlinkPartner}
        isLoading={isLoading}
      />
    </div>
  );
};

export default PartnerSettings;
