import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
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
import { Loader2, UserPlus, UserX, Copy, Check } from 'lucide-react';
import { usePartnerInvitations } from '@/hooks/usePartnerInvitations';
import { supabase } from '@/integrations/supabase/client';

const PartnerSettings = () => {
  const { profile, user } = useAuth();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isUnlinkDialogOpen, setIsUnlinkDialogOpen] = useState(false);
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerProfile, setPartnerProfile] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  
  const {
    isLoading,
    sendInvitation,
    unlinkPartner,
    fetchInvitations,
    activeInvitation
  } = usePartnerInvitations();
  
  const hasPartner = Boolean(profile?.partner_id);
  
  useEffect(() => {
    if (user) {
      fetchInvitations();
      fetchPartnerProfile();
    }
  }, [user, profile?.partner_id, fetchInvitations]);
  
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
  
  const handleInvitePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await sendInvitation(partnerEmail);
    
    if (!error) {
      setIsInviteDialogOpen(false);
      setPartnerEmail('');
      toast.success('Invitation sent to partner');
    }
  };
  
  const handleUnlinkPartner = async () => {
    const { error } = await unlinkPartner();
    
    if (!error) {
      setIsUnlinkDialogOpen(false);
      setPartnerProfile(null);
    }
  };
  
  const handleCopyInvite = () => {
    if (!activeInvitation) return;
    
    navigator.clipboard.writeText(activeInvitation.invitation_code);
    setCopied(true);
    toast.success('Invitation code copied to clipboard');
    
    setTimeout(() => setCopied(false), 2000);
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
              variant="outline" 
              onClick={() => setIsUnlinkDialogOpen(true)}
              className="gap-2"
            >
              <UserX className="h-4 w-4" />
              Unlink Partner
            </Button>
          </div>
        </div>
      ) : activeInvitation ? (
        <div className="p-4 rounded-lg border">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Pending Invitation</p>
              <p className="font-medium">You've invited {activeInvitation.recipient_email}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Share this code with your partner
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="bg-muted p-2 rounded font-mono">
                {activeInvitation.invitation_code}
              </div>
              <Button size="sm" variant="outline" onClick={handleCopyInvite}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-lg border flex flex-col items-center justify-center text-center">
          <p className="mb-4 text-muted-foreground">You haven't connected with a partner yet.</p>
          <Button onClick={() => setIsInviteDialogOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Invite Partner
          </Button>
        </div>
      )}
      
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Partner</DialogTitle>
            <DialogDescription>
              Enter your partner's email to send them an invitation to connect.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleInvitePartner} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="partnerEmail">Partner's Email</Label>
              <Input
                id="partnerEmail"
                type="email"
                value={partnerEmail}
                onChange={(e) => setPartnerEmail(e.target.value)}
                placeholder="partner@example.com"
                required
              />
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsInviteDialogOpen(false);
                  setPartnerEmail('');
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Invitation'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isUnlinkDialogOpen} onOpenChange={setIsUnlinkDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unlink Partner</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unlink your partner? This will remove access to shared goals and relationship data.
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
                  Unlinking...
                </>
              ) : (
                'Unlink Partner'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PartnerSettings;
