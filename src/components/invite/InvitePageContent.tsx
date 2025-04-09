
import React from 'react';
import { CheckCircle, XCircle, ArrowRight, Loader2, Heart, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface InvitePageContentProps {
  status: 'loading' | 'valid' | 'invalid' | 'accepted' | 'error';
  isProcessing: boolean;
  inviterName: string;
  errorMessage: string;
  handleAcceptInvitation: () => Promise<void>;
}

const InvitePageContent: React.FC<InvitePageContentProps> = ({
  status,
  isProcessing,
  inviterName,
  errorMessage,
  handleAcceptInvitation
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-love-50 via-harmony-50 to-calm-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === 'loading' && <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />}
            {status === 'valid' && (
              <div className="relative">
                <Heart className="h-12 w-12 text-love-500" />
                <UserPlus className="h-5 w-5 text-harmony-500 absolute bottom-0 right-0 bg-white rounded-full p-0.5" />
              </div>
            )}
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
          {status === 'loading' && <LoadingContent />}
          {status === 'valid' && <ValidContent isProcessing={isProcessing} onAccept={handleAcceptInvitation} />}
          {status === 'accepted' && <AcceptedContent />}
          {status === 'invalid' && <InvalidContent errorMessage={errorMessage} />}
          {status === 'error' && <ErrorContent errorMessage={errorMessage} />}
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

const LoadingContent = () => (
  <div className="py-8">
    <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
    <p className="mt-4 text-muted-foreground">Please wait while we process your invitation...</p>
  </div>
);

const ValidContent = ({ isProcessing, onAccept }: { isProcessing: boolean; onAccept: () => Promise<void> }) => (
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
      onClick={onAccept}
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
);

const AcceptedContent = () => (
  <div className="py-8">
    <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
    <p className="mt-4">
      Congratulations! You're now connected with your partner and can access all the relationship features together.
    </p>
  </div>
);

const InvalidContent = ({ errorMessage }: { errorMessage: string }) => (
  <div className="py-8">
    <XCircle className="h-16 w-16 text-red-500 mx-auto" />
    <p className="mt-4 text-muted-foreground">
      {errorMessage || 'The invitation link you\'re trying to use is invalid, expired, or has already been used.'}
    </p>
    <p className="mt-2 text-muted-foreground">
      Please ask your partner to send you a new invitation.
    </p>
  </div>
);

const ErrorContent = ({ errorMessage }: { errorMessage: string }) => (
  <div className="py-8">
    <XCircle className="h-16 w-16 text-red-500 mx-auto" />
    <p className="mt-4 text-muted-foreground">
      {errorMessage || 'There was a problem processing this invitation.'}
    </p>
    <p className="mt-2 text-muted-foreground">
      {errorMessage ? '' : 'It may be your own invitation, or one of you might already have a partner.'}
    </p>
  </div>
);

export default InvitePageContent;
