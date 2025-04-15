
import React, { useState } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { acceptInvitation } from '@/services/partners/partnershipService';
import { formatToken } from '@/hooks/partner-invites/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
  
  const validateCode = async (inputCode: string) => {
    // Clean the code (remove spaces, uppercase)
    const formattedCode = formatToken(inputCode);
    
    if (!formattedCode) {
      return { valid: false, error: 'Please enter a valid invitation code' };
    }
    
    try {
      console.log('Validating code:', formattedCode);
      
      // First try to check in partner_codes table
      const { data: partnerCodeData, error: partnerCodeError } = await supabase
        .from('partner_codes')
        .select('*')
        .eq('code', formattedCode)
        .eq('is_used', false)
        .or('expires_at.is.null,expires_at.gt.now()')
        .maybeSingle();
      
      if (partnerCodeData) {
        console.log('Found valid partner code:', partnerCodeData);
        
        // Check if user is trying to connect to themselves
        if (partnerCodeData.inviter_id === user?.id) {
          return { valid: false, error: 'You cannot connect with yourself' };
        }
        
        // Check if the inviter already has a partner
        const { data: inviterProfile, error: inviterProfileError } = await supabase
          .from('user_profiles')
          .select('partner_id')
          .eq('id', partnerCodeData.inviter_id)
          .single();
          
        if (inviterProfileError) {
          console.error('Error checking inviter profile:', inviterProfileError);
        } else if (inviterProfile?.partner_id && inviterProfile.partner_id !== user?.id) {
          return { valid: false, error: 'The inviter is already connected with another partner' };
        }
        
        return { valid: true, error: null };
      }
      
      console.log('No partner code found, checking partner_invites table...');
      
      // If not found in partner_codes, try the partner_invites table
      const { data: inviteData, error: inviteError } = await supabase
        .from('partner_invites')
        .select('*')
        .eq('token', formattedCode)
        .eq('is_accepted', false)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();
      
      if (inviteData) {
        console.log('Found valid partner invite:', inviteData);
        
        // Check if user is trying to connect to themselves
        if (inviteData.inviter_id === user?.id) {
          return { valid: false, error: 'You cannot connect with yourself' };
        }
        
        // Check if the inviter already has a partner
        const { data: inviterProfile, error: inviterProfileError } = await supabase
          .from('user_profiles')
          .select('partner_id')
          .eq('id', inviteData.inviter_id)
          .single();
          
        if (inviterProfileError) {
          console.error('Error checking inviter profile:', inviterProfileError);
        } else if (inviterProfile?.partner_id && inviterProfile.partner_id !== user?.id) {
          return { valid: false, error: 'The inviter is already connected with another partner' };
        }
        
        return { valid: true, error: null };
      }
      
      console.log('No valid partner code or invite found');
      return { 
        valid: false, 
        error: 'Invalid invitation code. It may be expired or already used.' 
      };
    } catch (err) {
      console.error('Error validating invite code:', err);
      return { valid: false, error: 'Failed to validate code. Please try again.' };
    }
  };
  
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
      // First validate the code
      setIsValidating(true);
      const validationResult = await validateCode(formattedCode);
      setIsValidating(false);
      
      if (!validationResult.valid) {
        setError(validationResult.error || 'Invalid code');
        setIsSubmitting(false);
        return;
      }
      
      // Then accept the invitation
      const { error } = await acceptInvitation(formattedCode, user.id);
      
      if (error) {
        setError(error.message);
        console.error('Error accepting invitation:', error);
        return;
      }
      
      // Update profile to reflect new partner connection
      if (fetchUserProfile) {
        await fetchUserProfile(user.id);
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
