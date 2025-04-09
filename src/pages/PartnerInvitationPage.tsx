
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePartnerInvite } from '@/hooks/usePartnerInvite';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Heart, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const PartnerInvitationPage = () => {
  const { code } = useParams<{ code: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const { acceptInvitation } = usePartnerInvite();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      // If not logged in, redirect to auth page with return URL
      const returnUrl = encodeURIComponent(`/invitation/${code}`);
      navigate(`/auth?returnUrl=${returnUrl}`);
    }
  }, [user, authLoading, code, navigate]);

  const handleAcceptInvitation = async () => {
    if (!code || !user) return;
    
    setIsProcessing(true);
    
    try {
      const { error } = await acceptInvitation(code);
      
      if (error) {
        setStatus('error');
        setErrorMessage(error.message || 'Failed to accept invitation');
        toast.error(error.message || 'Failed to accept invitation');
        console.error('Error accepting invitation:', error);
      } else {
        setStatus('success');
        toast.success('Partner connected successfully!');
      }
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      setStatus('error');
      setErrorMessage(error.message || 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  // Automatically attempt to accept the invitation when the component loads
  useEffect(() => {
    if (user && code && status === 'loading' && !isProcessing) {
      handleAcceptInvitation();
    }
  }, [user, code, status, isProcessing]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-love-50 via-harmony-50 to-calm-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Checking invitation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-love-50 via-harmony-50 to-calm-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === 'loading' && <Loader2 className="h-12 w-12 text-love-500 animate-spin" />}
            {status === 'success' && <CheckCircle className="h-12 w-12 text-green-500" />}
            {status === 'error' && <XCircle className="h-12 w-12 text-red-500" />}
          </div>
          <CardTitle className="text-xl sm:text-2xl gradient-heading">
            Partner Invitation
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Processing your invitation...'}
            {status === 'success' && 'You have successfully connected with your partner!'}
            {status === 'error' && (errorMessage || 'There was a problem with this invitation.')}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center">
          {status === 'loading' && (
            <div className="py-8">
              <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
              <p className="mt-4 text-muted-foreground">Please wait while we process your invitation...</p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <p className="mt-4">
                Congratulations! You're now connected with your partner and can access all the relationship features together.
              </p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="py-8">
              <XCircle className="h-16 w-16 text-red-500 mx-auto" />
              <p className="mt-4 text-muted-foreground">
                {errorMessage || 'This invitation may have expired, already been used, or is invalid.'}
              </p>
              <p className="mt-2 text-muted-foreground">
                {errorMessage ? '' : 'Please ask your partner to send you a new invitation.'}
              </p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <Button 
            onClick={() => navigate('/dashboard')}
            className="px-6"
          >
            Go to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PartnerInvitationPage;
