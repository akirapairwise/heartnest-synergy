
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
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
import { Loader2, UserPlus, UserX } from 'lucide-react';

const PartnerSettings = () => {
  const { profile, fetchUserProfile } = useAuth();
  const [partnerProfile, setPartnerProfile] = useState<any>(null);
  const [isUnlinkDialogOpen, setIsUnlinkDialogOpen] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const navigate = useNavigate();
  
  React.useEffect(() => {
    if (profile?.partner_id) {
      fetchPartnerProfile(profile.partner_id);
    }
  }, [profile?.partner_id]);
  
  const fetchPartnerProfile = async (partnerId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', partnerId)
        .single();
        
      if (error) throw error;
      
      setPartnerProfile(data);
    } catch (error) {
      console.error('Error fetching partner profile:', error);
    }
  };
  
  const handleUnlinkPartner = async () => {
    if (!profile?.partner_id) return;
    
    setIsUnlinking(true);
    try {
      // Update both user profiles to remove partner connection
      const partnerId = profile.partner_id;
      
      // Update current user profile
      const { error: updateUserError } = await supabase
        .from('user_profiles')
        .update({ partner_id: null })
        .eq('id', profile.id);
        
      if (updateUserError) throw updateUserError;
      
      // Update partner profile
      const { error: updatePartnerError } = await supabase
        .from('user_profiles')
        .update({ partner_id: null })
        .eq('id', partnerId);
        
      if (updatePartnerError) throw updatePartnerError;
      
      // Close dialog and show success message
      setIsUnlinkDialogOpen(false);
      toast.success('Partner connection removed successfully');
      
      // Refresh user profile
      if (fetchUserProfile) {
        await fetchUserProfile();
      }
      
      // Clear partner profile state
      setPartnerProfile(null);
      
    } catch (error) {
      console.error('Error unlinking partner:', error);
      toast.error('Failed to remove partner connection');
    } finally {
      setIsUnlinking(false);
    }
  };
  
  const handleConnectPartner = () => {
    navigate('/connect');
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Partner Connection</CardTitle>
          <CardDescription>
            Connect with your partner to unlock shared features
          </CardDescription>
        </CardHeader>
        <CardContent>
          {profile?.partner_id ? (
            <div className="space-y-4">
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
            </div>
          ) : (
            <div className="p-6 rounded-lg border flex flex-col items-center justify-center text-center">
              <p className="mb-4 text-muted-foreground">You haven't connected with a partner yet.</p>
              <Button onClick={handleConnectPartner} className="gap-2">
                <UserPlus className="h-4 w-4" />
                Connect Partner
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <AlertDialog open={isUnlinkDialogOpen} onOpenChange={setIsUnlinkDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Break Partner Connection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end your partner connection? This will permanently disconnect you from your partner and affect shared goals and relationship data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUnlinking}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnlinkPartner}
              disabled={isUnlinking}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isUnlinking ? (
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
