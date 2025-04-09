
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Loader2, UserPlus, UserX, Copy, Check, Link, Clock, RefreshCw } from 'lucide-react';
import { usePartnerInvite } from '@/hooks/usePartnerInvite';
import { supabase } from '@/integrations/supabase/client';

const PartnerSettings = () => {
  const { profile, user } = useAuth();
  const [isUnlinkDialogOpen, setIsUnlinkDialogOpen] = useState(false);
  const [partnerProfile, setPartnerProfile] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  
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
  
  const handleCopyInvite = () => {
    if (!inviteUrl) return;
    
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    toast.success('Invitation link copied to clipboard');
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleRegenerateToken = async () => {
    await regenerateToken();
  };
  
  const getInviteExpiration = () => {
    if (!activeInvite?.expires_at) return null;
    
    const expiresAt = new Date(activeInvite.expires_at);
    const now = new Date();
    const diffTime = Math.abs(expiresAt.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays === 1 ? '1 day' : `${diffDays} days`;
  };
  
  return (
    <div className="space-y-4">
      {hasPartner ? (
        <div className="p-4 rounded-lg border">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Connected Partner</p>
              <p className="font-medium">{partnerProfile?.full_name || 'Partner'}</p>
              {partnerProfile?.location && (
                <p className="text-sm text-muted-foreground">{partnerProfile.location}</p>
              )}
            </div>
            <Button 
              variant="destructive" 
              onClick={() => setIsUnlinkDialogOpen(true)}
              className="gap-2"
            >
              <UserX className="h-4 w-4" />
              Break Partner Connection
            </Button>
          </div>
        </div>
      ) : activeInvite ? (
        <div className="p-4 rounded-lg border">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Partner Invitation</p>
              <p className="font-medium">Share this link with your partner</p>
              <p className="text-sm text-muted-foreground mt-1">
                They'll be able to connect with you after clicking the link
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="bg-muted p-2 rounded font-mono text-xs overflow-hidden text-ellipsis whitespace-nowrap flex-1">
                {inviteUrl}
              </div>
              <Button size="sm" variant="outline" onClick={handleCopyInvite}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            
            {getInviteExpiration() && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                <span>Expires in {getInviteExpiration()}</span>
              </div>
            )}
            
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleRegenerateToken} 
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Regenerate Link
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-lg border flex flex-col items-center justify-center text-center">
          <p className="mb-4 text-muted-foreground">You haven't connected with a partner yet.</p>
          <Button onClick={handleCreateInvite} disabled={isLoading} className="gap-2">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Link className="h-4 w-4" />
                Create Invitation Link
              </>
            )}
          </Button>
        </div>
      )}
      
      <AlertDialog open={isUnlinkDialogOpen} onOpenChange={setIsUnlinkDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Break Partner Connection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end your partner connection? This will permanently disconnect you from your partner and affect shared goals and relationship data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnlinkPartner}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Breaking connection...
                </>
              ) : (
                'Break Connection'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PartnerSettings;
