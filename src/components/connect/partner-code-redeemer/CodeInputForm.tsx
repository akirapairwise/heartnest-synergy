
import React, { useState } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, ArrowRight, Loader2, UserLink } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { acceptInvitation } from '@/services/partners/partnershipService';
import { getInvitationByToken } from '@/services/partnerInviteService';
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
  const { user, fetchUserProfile } = useAuth();
  
  const validateCode = async (inputCode: string) => {
    // Clean the code (remove spaces, uppercase)
    const formattedCode = formatToken(inputCode);
    
    if (!formattedCode) {
      return { valid: false, error: 'Please enter a valid invitation code' };
    }
    
    try {
      const { data, error } = await getInvitationByToken(formattedCode);
      
      if (error || !data) {
        console.error('Error validating code:', error);
        return { 
          valid: false, 
          error: error?.message || 'Invalid invitation code. It may be expired or already used.' 
        };
      }
      
      return { valid: true, error: null };
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
            <UserLink className="h-6 w-6" />
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
                disabled={isSubmitting || isValidating}
                autoComplete="off"
              />
              <Button 
                type="submit" 
                disabled={isSubmitting || isValidating || !code}
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
