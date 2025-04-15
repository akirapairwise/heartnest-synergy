import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, CalendarHeart, Gift, UserX, Loader2, UserPlus, AlertCircle, RefreshCw } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { unlinkPartner } from '@/services/partners/partnershipService';
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

const PartnerCard = () => {
  const navigate = useNavigate();
  const { profile, fetchUserProfile, user } = useAuth();
  const [partnerProfile, setPartnerProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnlinkDialogOpen, setIsUnlinkDialogOpen] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (profile?.partner_id) {
      fetchPartnerProfile(profile.partner_id);
    } else {
      setIsLoading(false);
    }
  }, [profile?.partner_id]);
  
  const fetchPartnerProfile = async (partnerId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Fetching partner profile for:", partnerId);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', partnerId)
        .single();
        
      if (error) {
        console.error("Error fetching partner profile:", error);
        if (error.code === 'PGRST116') {
          setError("Partner profile not found. They may have deleted their account.");
        } else if (error.code === '42501') {
          setError("You don't have permission to view this partner's profile.");
        } else {
          setError("Could not load partner information. Please try again later.");
        }
        throw error;
      }
      
      if (!data) {
        setError("Partner profile not found.");
        return;
      }
      
      console.log("Partner profile fetched successfully:", data);
      setPartnerProfile(data);
    } catch (error) {
      console.error('Error fetching partner profile:', error);
      // We don't show the toast here anymore since we're displaying the error in the card
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
      
      // Use the improved unlinkPartner function from partnershipService
      const partnerId = profile.partner_id;
      const { error } = await unlinkPartner(user.id, partnerId);
      
      if (error) {
        console.error("Error unlinking partner:", error);
        throw error;
      }
      
      // Close dialog and show success message
      setIsUnlinkDialogOpen(false);
      toast.success('Partner connection removed successfully');
      
      // Refresh user profile
      console.log("Refreshing user profile...");
      if (fetchUserProfile && user) {
        try {
          await fetchUserProfile(user.id);
          console.log("Profile refreshed successfully after unlinking");
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
  
  const handleMessagePartner = () => {
    // In a real app, this would navigate to a messaging screen
    toast.info("Coming soon", {
      description: "Messaging feature will be available in the next update"
    });
  };
  
  const handlePlanDate = () => {
    navigate('/goals');
  };
  
  const handleGiftIdeas = () => {
    navigate('/recommendations');
  };
  
  // Get partner initials for the avatar fallback
  const getInitials = (name: string) => {
    if (!name) return 'PA';
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-4 flex justify-center items-center min-h-[150px]">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-4 text-center">
          <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-3">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              if (profile?.partner_id) {
                fetchPartnerProfile(profile.partner_id);
              }
            }}
            className="mb-2"
          >
            Try Again
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => setIsUnlinkDialogOpen(true)}
            className="w-full"
          >
            <UserX className="h-4 w-4 mr-2" />
            Remove Partner Connection
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  if (!partnerProfile) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-4 text-center">
          <p className="text-muted-foreground mb-2">No partner connected</p>
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => navigate('/connect')}
            className="gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Connect Partner
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  // Calculate upcoming anniversary (using a placeholder date if not available)
  // In a real app, this would come from relationship data
  const anniversaryDate = new Date(); // Placeholder
  anniversaryDate.setMonth(anniversaryDate.getMonth() + 2); // Just set 2 months in the future for demo
  
  const today = new Date();
  const nextAnniversary = new Date(today.getFullYear(), anniversaryDate.getMonth(), anniversaryDate.getDate());
  
  if (nextAnniversary < today) {
    nextAnniversary.setFullYear(today.getFullYear() + 1);
  }
  
  const daysUntilAnniversary = Math.ceil((nextAnniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate upcoming birthday (using a placeholder date if not available)
  const birthdayDate = new Date();
  birthdayDate.setMonth(birthdayDate.getMonth() + 1); // Just set 1 month in the future for demo
  
  const formattedAnniversary = anniversaryDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const formattedBirthday = birthdayDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={partnerProfile.avatar_url} alt="Partner" />
            <AvatarFallback>{getInitials(partnerProfile.full_name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-medium">{partnerProfile.full_name || 'Partner'}</h3>
            <div className="flex items-center">
              <div className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                Connected
              </div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => setIsUnlinkDialogOpen(true)}
          >
            <UserX className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-3">
          <Button variant="outline" size="sm" className="h-8 text-xs px-2" onClick={handleMessagePartner}>
            <MessageSquare className="h-3.5 w-3.5 mr-1" />
            Message
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs px-2" onClick={handlePlanDate}>
            <CalendarHeart className="h-3.5 w-3.5 mr-1" />
            Date
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs px-2" onClick={handleGiftIdeas}>
            <Gift className="h-3.5 w-3.5 mr-1" />
            Gift
          </Button>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground text-xs">Anniversary</span>
            <span className="text-xs">{formattedAnniversary} ({daysUntilAnniversary} days)</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground text-xs">Birthday</span>
            <span className="text-xs">{formattedBirthday}</span>
          </div>
          
          {partnerProfile.location && (
            <div className="flex justify-between">
              <span className="text-muted-foreground text-xs">Location</span>
              <span className="text-xs">{partnerProfile.location}</span>
            </div>
          )}
        </div>
      </CardContent>
      
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
    </Card>
  );
};

export default PartnerCard;
