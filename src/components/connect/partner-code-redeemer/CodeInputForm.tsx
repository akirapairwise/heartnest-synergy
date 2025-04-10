
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowRight, ArrowLeft, Lock } from "lucide-react";
import { redeemPartnerCode } from "@/services/partnerCodeService";
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Form component for entering and submitting a partner code
 */
const CodeInputForm = () => {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, fetchUserProfile } = useAuth();
  
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
      console.log('Proceeding to redeem partner code:', formattedCode);
      const result = await redeemPartnerCode(formattedCode);
      
      if (result.success) {
        toast.success(result.message);
        
        // Refresh user profile after successful redemption
        if (user?.id && fetchUserProfile) {
          await fetchUserProfile(user.id);
        }
        
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        setError(result.message);
        
        // If the error indicates the code is invalid or expired, clear the input
        if (result.message === 'Invalid or expired code' || 
            result.message.includes('inviter no longer has an account')) {
          setCode('');
        }
      }
    } catch (err) {
      console.error('Error redeeming partner code:', err);
      setError('An unexpected error occurred. Please try again.');
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
        <CardDescription>Enter the 6-digit code your partner shared with you</CardDescription>
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
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
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
              Ask your partner to generate a partner code and enter it here
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
