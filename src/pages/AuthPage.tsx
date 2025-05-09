
import React, { useEffect, useState } from 'react';
import AuthForm from '@/components/auth/AuthForm';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2 } from 'lucide-react';

const AuthPage = () => {
  const { user, isLoading, isOnboardingComplete, refreshSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pageLoading, setPageLoading] = useState(true);
  const [hasAttemptedRefresh, setHasAttemptedRefresh] = useState(false);
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);
  
  // Get the returnUrl and redirected status from query params
  const params = new URLSearchParams(location.search);
  const returnUrl = params.get('returnUrl') || '/dashboard';
  const redirected = params.get('redirected');

  // Show confirmation message if user was redirected from email verification
  useEffect(() => {
    if (redirected === 'confirmation') {
      setShowConfirmationMessage(true);
      
      // Hide the message after 5 seconds
      const timer = setTimeout(() => {
        setShowConfirmationMessage(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [redirected]);

  // Try refreshing the session once
  useEffect(() => {
    if (!user && !isLoading && !hasAttemptedRefresh) {
      const attemptSessionRefresh = async () => {
        setHasAttemptedRefresh(true);
        console.log('Auth page: attempting to refresh session');
        await refreshSession();
        setPageLoading(false);
      };
      attemptSessionRefresh();
    } else if (!isLoading) {
      setPageLoading(false);
    }
  }, [user, isLoading, refreshSession, hasAttemptedRefresh]);

  // Handle redirects
  useEffect(() => {
    // Only redirect if we have a user and loading is complete
    if (!isLoading && !pageLoading && user) {
      // If user is authenticated, redirect to appropriate page
      console.log('User authenticated, redirecting from auth page');
      const redirectPath = isOnboardingComplete ? returnUrl : '/onboarding';
      navigate(redirectPath, { replace: true });
    }
  }, [user, isLoading, pageLoading, isOnboardingComplete, navigate, returnUrl]);

  // Show loading screen while checking authentication
  if (isLoading || pageLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-love-50 via-harmony-50 to-calm-50 p-4">
        <Loader2 className="h-10 w-10 text-love-500 animate-spin mb-4" />
        <p className="text-harmony-700">Getting everything ready...</p>
      </div>
    );
  }

  // Show auth form if user is not authenticated
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-love-50 via-harmony-50 to-calm-50 p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-love-700 mb-6 hidden md:block">Usora</h1>
        
        {showConfirmationMessage && (
          <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle>Email verified!</AlertTitle>
            <AlertDescription>
              Your account has been successfully verified. You can now log in.
            </AlertDescription>
          </Alert>
        )}
        
        <AuthForm />
        <p className="text-center text-gray-500 text-sm mt-6">
          Nurture your relationships with our thoughtfully designed tools
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
