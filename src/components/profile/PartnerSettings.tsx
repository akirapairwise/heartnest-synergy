
import React, { useState } from 'react';
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
import { Loader2, UserPlus, UserX } from 'lucide-react';

const PartnerSettings = () => {
  const { profile } = useAuth();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isUnlinkDialogOpen, setIsUnlinkDialogOpen] = useState(false);
  const [partnerEmail, setPartnerEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // This is a placeholder for the actual partner data
  // In a real app, you would fetch this from your Supabase database
  const hasPartner = Boolean(profile?.partner_id);
  
  const handleInvitePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // This is a placeholder for the actual invite logic
      // In a real app, you would implement this using Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Invitation sent to partner');
      setIsInviteDialogOpen(false);
      setPartnerEmail('');
    } catch (error) {
      console.error('Error inviting partner:', error);
      toast.error('Failed to send invitation');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUnlinkPartner = async () => {
    setIsLoading(true);
    
    try {
      // This is a placeholder for the actual unlink logic
      // In a real app, you would implement this using Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Partner unlinked successfully');
      setIsUnlinkDialogOpen(false);
    } catch (error) {
      console.error('Error unlinking partner:', error);
      toast.error('Failed to unlink partner');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      {hasPartner ? (
        <div className="p-4 rounded-lg border">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Connected Partner</p>
              <p className="font-medium">Partner Name</p>
              <p className="text-sm text-muted-foreground">partner@example.com</p>
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
