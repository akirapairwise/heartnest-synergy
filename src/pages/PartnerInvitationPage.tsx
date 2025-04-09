
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePartnerInvite } from '@/hooks/usePartnerInvite';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Heart, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { getInvitationByToken } from '@/services/partnerInviteService';

const PartnerInvitationPage = () => {
  const { code } = useParams<{ code: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const { acceptInvitation } = usePartnerInvite();
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'accepted' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [inviterName, setInviterName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      // If not logged in, redirect to auth page with return URL
      const returnUrl = encodeURIComponent(`/invitation/${code}`);
      navigate(`/auth?returnUrl=${returnUrl}`);
      return;
    }

    // Validate the token
    if (code && user && status === 'loading') {
      validateToken(code);
    } else if (!code) {
      setStatus('invalid');
      setErrorMessage('No invitation code provided');
    }
  }, [code, user, authLoading, status]);

  const validateToken = async (token: string) => {
    try {
      console.log('Validating token:', token);
      const { data, error } = await getInvitationByToken(token);
      
      if (error || !data) {
        console.error('Invalid token:', error);
        setStatus('invalid');
        setErrorMessage(error?.message || 'This invitation link is invalid, expired, or has already been used');
        return;
      }
      
      // Check if user is trying to accept their own invitation
      if (data.inviter_id === user?.id) {
        console.log('User tried to accept their own invitation');
        setStatus('error');
        setErrorMessage('You cannot accept your own invitation');
        return;
      }
      
      // Set the inviter name if available
      if (data.inviter_name) {
        setInviterName(data.inviter_name);
      }
      
      console.log('Token is valid');
      setStatus('valid');
    } catch (error) {
      console.error('Error validating token:', error);
      setStatus('error');
      setErrorMessage('There was a problem processing this invitation');
    }
  };

  const handleAcceptInvitation = async () => {
    if (!code || !user) return;
    
    setIsProcessing(true);
    
    try {
      console.log('Accepting invitation...');
      const { error } = await acceptInvitation(code);
      
      if (error) {
        console.error('Failed to accept invitation:', error);
        setStatus('error');
        setErrorMessage(error.message || 'There was a problem accepting this invitation');
        toast.error(error.message || 'Failed to accept invitation');
      } else {
        console.log('Invitation accepted successfully');
        setStatus('accepted');
        toast.success('Partner connection successful!');
      }
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      setStatus('error');
      setErrorMessage(error.message || 'There was a problem accepting this invitation');
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading) {
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
            {status === 'loading' && <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />}
            {status === 'valid' && <Heart className="h-12 w-12 text-love-500" />}
            {status === 'accepted' && <CheckCircle className="h-12 w-12 text-green-500" />}
            {(status === 'invalid' || status === 'error') && <XCircle className="h-12 w-12 text-red-500" />}
          </div>
          <CardTitle className="text-xl sm:text-2xl gradient-heading">
            Partner Invitation
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Validating invitation...'}
            {status === 'valid' && `You've been invited by ${inviterName || 'someone'} to connect as partners`}
            {status === 'accepted' && 'You have successfully connected with your partner!'}
            {status === 'invalid' && 'This invitation link is invalid or expired'}
            {status === 'error' && errorMessage}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center">
          {status === 'loading' && (
            <div className="py-8">
              <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
              <p className="mt-4 text-muted-foreground">Please wait while we process your invitation...</p>
            </div>
          )}
          
          {status === 'valid' && (
            <div className="py-8">
              <p className="mb-6">
                Connecting as partners will allow you to:
              </p>
              <ul className="text-left space-y-2 mb-6 max-w-xs mx-auto">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Share relationship goals</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Track moods and check-ins together</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Resolve conflicts collaboratively</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Get personalized relationship recommendations</span>
                </li>
              </ul>
              
              <Button 
                onClick={handleAcceptInvitation}
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    Accept Invitation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}
          
          {status === 'accepted' && (
            <div className="py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <p className="mt-4">
                Congratulations! You're now connected with your partner and can access all the relationship features together.
              </p>
            </div>
          )}
          
          {(status === 'invalid' || status === 'error') && (
            <div className="py-8">
              <XCircle className="h-16 w-16 text-red-500 mx-auto" />
              <p className="mt-4 text-muted-foreground">
                {errorMessage || 'The invitation link you\'re trying to use is invalid, expired, or has already been used.'}
              </p>
              <p className="mt-2 text-muted-foreground">
                Please ask your partner to send you a new invitation.
              </p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <Button 
            onClick={() => navigate('/dashboard')}
            variant={status === 'valid' ? 'outline' : 'default'}
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
