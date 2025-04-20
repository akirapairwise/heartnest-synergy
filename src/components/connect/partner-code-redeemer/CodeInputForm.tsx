
import React, { useState } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, ArrowRight, Loader2, User } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { acceptInvitation } from '@/services/partners/partnershipService';
import { formatToken } from '@/hooks/partner-invites/utils';
import { toast } from 'sonner';

/**
 * Form component for entering and submitting a partner code
 */
const CodeInputForm = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user, fetchUserProfile, profile } = useAuth();
  
  // Check if user already has a partner
  React.useEffect(() => {
    if (profile?.partner_id) {
      setError("You are already connected with a partner. Please disconnect first.");
    } else {
      setError(null);
    }
  }, [profile?.partner_id]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      setError('You must be logged in to connect with a partner');
      return;
    }
    
    if (!code) {
      setError('Please enter an invitation code');
      return;
    }
    
    // Check if user already has a partner
    if (profile?.partner_id) {
      setError('You already have a partner connected. Please disconnect first.');
      return;
    }
    
    // Format code: remove spaces, uppercase
    const formattedCode = formatToken(code);
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Accept the invitation using improved function from partnershipService
      console.log('Accepting invitation with code:', formattedCode);
      const { error } = await acceptInvitation(formattedCode, user.id);
      
      if (error) {
        setError(error.message || 'Error connecting with partner. Please try again.');
        console.error('Error accepting invitation:', error);
        setIsSubmitting(false);
        
        // Display more specific guidance based on error message
        if (error.message.includes("verify inviter profile")) {
          toast.error('Could not verify the inviter\'s profile. The code may be invalid or the inviter\'s account may not exist.');
        } else if (error.message.includes("create your profile")) {
          toast.error('Could not create your profile. Please try logging out and logging back in.');
        }
        return;
      }
      
      // Update profile to reflect new partner connection
      let profileUpdated = false;
      const maxProfileRefreshAttempts = 5;
      
      toast.success('Partner connection initiated! Updating your profile...');
      
      for (let attempt = 1; attempt <= maxProfileRefreshAttempts; attempt++) {
        try {
          if (fetchUserProfile) {
            console.log(`Refreshing user profile after connection (attempt ${attempt})...`);
            // Add a slight delay before refreshing profile
            await new Promise(resolve => setTimeout(resolve, 1000));
            await fetchUserProfile(user.id);
            
            // Verify partner is actually connected
            if (profile?.partner_id) {
              profileUpdated = true;
              console.log('Profile updated successfully with partner!');
              break;
            } else {
              console.log('Profile refreshed but partner not found yet, retrying...');
            }
          }
        } catch (profileError) {
          console.error(`Error refreshing profile after connection (attempt ${attempt}):`, profileError);
          if (attempt < maxProfileRefreshAttempts) {
            // Wait longer between retry attempts
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
        }
      }
      
      // Show success message
      toast.success('Partner connected successfully!');
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Error submitting code:', err);
      setError(err.message || 'Failed to redeem code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <Card className="w-full border-0 bg-transparent shadow-none">
      <CardHeader className="px-0 pt-0">
        <div className="flex justify-center mb-4">
          <div className="bg-love-100 text-love-600 p-4 rounded-full">
            <User className="h-6 w-6" />
          </div>
        </div>
        <CardTitle>Enter Partner Code</CardTitle>
        <CardDescription>Connect with your partner by entering their invitation code</CardDescription>
      </CardHeader>
      
      <CardContent className="px-0">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter invitation code"
                className="flex-1"
                disabled={isSubmitting || isValidating || !!profile?.partner_id}
                autoComplete="off"
                autoFocus
              />
              <Button 
                type="submit" 
                disabled={isSubmitting || isValidating || !code || !!profile?.partner_id}
                className="gap-1"
              >
                {isSubmitting || isValidating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter the code your partner shared with you
            </p>
          </div>
        </form>
        
        <div className="mt-6 p-4 border rounded-lg bg-muted/30">
          <p className="text-sm text-muted-foreground">
            Connecting with your partner allows you to share goals, track relationship health, and access features designed for couples.
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-center pt-2 px-0">
        <Button variant="link" onClick={handleSkip} size="sm">
          Skip for now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CodeInputForm;
