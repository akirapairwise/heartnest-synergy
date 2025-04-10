
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { redeemPartnerCode } from "@/services/partnerCodeService";
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";

const PartnerCodeRedeemer = () => {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { profile, fetchUserProfile, user } = useAuth();
  
  const hasPartner = Boolean(profile?.partner_id);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setError('Please enter a partner code');
      return;
    }
    
    // Format code: remove spaces, uppercase
    const formattedCode = code.trim().toUpperCase();
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await redeemPartnerCode(formattedCode);
      
      if (result.success) {
        toast.success(result.message);
        
        // Refresh the user profile to get updated partner status
        if (fetchUserProfile && user) {
          await fetchUserProfile(user.id);
        }
        
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        setError(result.message);
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
  
  if (hasPartner) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Connect With Partner</CardTitle>
          <CardDescription>You're already connected with a partner</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            You already have a partner connected to your account.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={handleSkip}
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Dashboard
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Connect With Partner</CardTitle>
        <CardDescription>Enter your partner's code to connect</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                className="font-mono text-center uppercase tracking-wider text-lg"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
              />
              <Button type="submit" disabled={isSubmitting || !code.trim()}>
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
      <CardFooter className="flex justify-center">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2"
          onClick={handleSkip}
        >
          <ArrowLeft className="h-4 w-4" />
          Skip
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PartnerCodeRedeemer;
