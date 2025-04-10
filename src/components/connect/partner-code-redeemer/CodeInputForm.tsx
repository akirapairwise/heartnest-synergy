
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowRight, ArrowLeft, Lock } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { acceptInvitation } from '@/services/partners/partnershipService';
import { getInvitationByToken } from '@/services/partnerInviteService';

/**
 * Form component for entering and submitting a partner code
 */
const CodeInputForm = () => {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, fetchUserProfile } = useAuth();
  
  const validateCode = async (code: string) => {
    // Clean the code (remove spaces, uppercase)
    const formattedCode = code.trim().toUpperCase();
    
    if (!formattedCode) {
      return { valid: false, error: 'Please enter a valid invitation code' };
    }
    
    console.log('Validating code before submission:', formattedCode);
    
    // Check if the invitation exists and is valid
    const { data: invite, error } = await getInvitationByToken(formattedCode);
    
    if (error || !invite) {
      console.log('Pre-validation failed:', error?.message);
      return { valid: false, error: error?.message || 'Invalid invitation code' };
    }
    
    // Extra validation to ensure user isn't inviting themselves
    if (user?.id && invite.inviter_id === user.id) {
      return { valid: false, error: 'You cannot accept your own invitation' };
    }
    
    return { valid: true, error: null };
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setError('Please enter a partner code');
      return;
    }
    
    if (!user?.id) {
      setError('You must be logged in to redeem a partner code');
      return;
    }
    
    // Format code: remove spaces, uppercase
    const formattedCode = code.trim().toUpperCase();
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log('User ID attempting to accept invitation:', user.id);
      console.log('Proceeding to accept invitation with token:', formattedCode);
      
      // First validate the code
      const validation = await validateCode(formattedCode);
      if (!validation.valid) {
        setError(validation.error || 'Invalid invitation code');
        setIsSubmitting(false);
        return;
      }
      
      // Use the partnership service to accept the invitation
      const result = await acceptInvitation(formattedCode, user.id);
      
      if (result.error) {
        console.error('Error accepting invitation:', result.error);
        setError(result.error.message || 'Failed to accept invitation');
        
        // If the error indicates the code is invalid or expired, clear the input
        if (result.error.message?.includes('invalid') || 
            result.error.message?.includes('expired') || 
            result.error.message?.includes('not found')) {
          setCode('');
        }
      } else {
        toast.success('You are now connected with your partner!');
        
        // Refresh user profile after successful redemption
        if (user?.id && fetchUserProfile) {
          await fetchUserProfile(user.id);
        }
        
        // Redirect to dashboard
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Error accepting invitation:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
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
            <Lock className="h-6 w-6" />
          </div>
        </div>
        <CardTitle>Enter Partner Code</CardTitle>
        <CardDescription>Enter the code your partner shared with you</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        {error && (
          <Alert variant="destructive" className="mb-4 bg-red-50 border-red-200 text-red-700">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                className="font-mono text-center uppercase tracking-wider text-lg bg-white/50 border-love-100 focus:border-love-300 focus-visible:ring-love-200 transition-all"
                placeholder="Enter partner code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={12}
              />
              <Button 
                type="submit" 
                disabled={isSubmitting || !code.trim()}
                className="bg-love-500 hover:bg-love-600 transition-all"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Ask your partner to generate an invitation code and enter it here
            </p>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center px-0">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 hover:text-muted-foreground/80 transition-all"
          onClick={handleSkip}
        >
          <ArrowLeft className="h-4 w-4" />
          Skip for now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CodeInputForm;
