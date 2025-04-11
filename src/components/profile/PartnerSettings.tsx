
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
import { Loader2, UserPlus, UserX, AlertCircle, RefreshCw } from 'lucide-react';

const PartnerSettings = () => {
  const { profile, fetchUserProfile, user } = useAuth();
  const [partnerProfile, setPartnerProfile] = useState<any>(null);
  const [isUnlinkDialogOpen, setIsUnlinkDialogOpen] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  React.useEffect(() => {
    if (profile?.partner_id) {
      fetchPartnerProfile(profile.partner_id);
    }
  }, [profile?.partner_id]);
  
  const fetchPartnerProfile = async (partnerId: string) => {
    try {
      setIsLoading(true);
      setFetchError(null);
      console.log("Fetching partner profile:", partnerId);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', partnerId)
        .single();
        
      if (error) {
        console.error("Error fetching partner profile:", error);
        if (error.code === 'PGRST116') {
          setFetchError("Partner profile not found. They may have deleted their account.");
        } else if (error.code === '42501') {
          setFetchError("You don't have permission to view this partner's profile.");
        } else {
          setFetchError("Could not load partner information. Please try again later.");
        }
        return;
      }
      
      if (!data) {
        setFetchError("Partner profile not found.");
        return;
      }
      
      console.log("Partner profile fetched:", data);
      setPartnerProfile(data);
    } catch (error) {
      console.error('Error fetching partner profile:', error);
      setFetchError("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUnlinkPartner = async () => {
    if (!profile?.partner_id || !user?.id) {
      toast.error("No partner to unlink");
      return;
    }
    
    setIsUnlinking(true);
    try {
      console.log("Starting partner unlinking process...");
      // Update both user profiles to remove partner connection
      const partnerId = profile.partner_id;
      
      // Update current user profile
      console.log("Updating current user profile...");
      const { error: updateUserError } = await supabase
        .from('user_profiles')
        .update({ partner_id: null })
        .eq('id', user.id);
        
      if (updateUserError) {
        console.error("Error updating current user profile:", updateUserError);
        throw updateUserError;
      }
      
      // Update partner profile
      console.log("Updating partner profile...");
      const { error: updatePartnerError } = await supabase
        .from('user_profiles')
        .update({ partner_id: null })
        .eq('id', partnerId);
        
      if (updatePartnerError) {
        console.error("Error updating partner profile:", updatePartnerError);
        throw updatePartnerError;
      }
      
      // Close dialog and show success message
      setIsUnlinkDialogOpen(false);
      toast.success('Partner connection removed successfully');
      
      // Refresh user profile
      console.log("Refreshing user profile...");
      if (fetchUserProfile && user) {
        try {
          await fetchUserProfile(user.id);
          console.log("Profile refreshed successfully");
        } catch (refreshError) {
          console.error("Error refreshing profile after unlinking:", refreshError);
          // We can continue even if refresh fails
        }
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
              {isLoading ? (
                <div className="p-6 rounded-lg border flex flex-col items-center justify-center text-center">
                  <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                  <p className="text-muted-foreground">Loading partner information...</p>
                </div>
              ) : fetchError ? (
                <div className="p-6 rounded-lg border flex flex-col items-center justify-center text-center">
                  <AlertCircle className="h-8 w-8 text-amber-500 mb-2" />
                  <p className="text-muted-foreground mb-3">{fetchError}</p>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        if (profile?.partner_id) {
                          fetchPartnerProfile(profile.partner_id);
                        }
                      }}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => setIsUnlinkDialogOpen(true)}
                    >
                      <UserX className="h-4 w-4 mr-2" />
                      Remove Connection
                    </Button>
                  </div>
                </div>
              ) : (
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
              )}
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
