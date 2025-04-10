import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, CalendarHeart, Gift, UserX, Loader2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { usePartnerInvite } from '@/hooks/usePartnerInvite';
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
  const { profile, user } = useAuth();
  const { unlinkPartner } = usePartnerInvite();
  const [partnerProfile, setPartnerProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnlinkDialogOpen, setIsUnlinkDialogOpen] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  
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
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', partnerId)
        .single();
        
      if (error) throw error;
      
      setPartnerProfile(data);
    } catch (error) {
      console.error('Error fetching partner profile:', error);
      toast.error('Could not load partner information');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUnlinkPartner = async () => {
    if (!user || !profile?.partner_id) return;
    
    setIsUnlinking(true);
    const { error } = await unlinkPartner();
    
    if (error) {
      toast.error('Failed to break partner connection');
      console.error('Error unlinking partner:', error);
    } else {
      toast.success('Partner connection broken successfully');
      setPartnerProfile(null);
    }
    
    setIsUnlinking(false);
    setIsUnlinkDialogOpen(false);
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
  
  if (!partnerProfile) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-4 text-center">
          <p className="text-muted-foreground mb-2">No partner connected</p>
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => navigate('/connect')}
          >
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
