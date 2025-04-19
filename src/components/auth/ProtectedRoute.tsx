
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading, isOnboardingComplete, refreshSession } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [hasAttemptedRefresh, setHasAttemptedRefresh] = useState(false);
  const [redirectTimeout, setRedirectTimeout] = useState<NodeJS.Timeout | null>(null);

  // Try to refresh session once if no user is found
  useEffect(() => {
    const checkAndRefreshSession = async () => {
      if (!user && !isLoading && !hasAttemptedRefresh) {
        console.log('No user detected in protected route, attempting to refresh session');
        setHasAttemptedRefresh(true);
        await refreshSession();
      }
    };
    
    checkAndRefreshSession();
  }, [refreshSession, user, isLoading, hasAttemptedRefresh]);

  // Handle redirects with a safety timeout
  useEffect(() => {
    // Clear any existing timeout
    if (redirectTimeout) {
      clearTimeout(redirectTimeout);
    }

    // If still loading after 5 seconds, force redirect to auth page
    // This prevents infinite loading if something goes wrong
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log('Loading timeout reached, redirecting to auth page');
        navigate('/auth', { state: { from: location.pathname }, replace: true });
      }
    }, 5000);

    setRedirectTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isLoading, navigate, location.pathname]);

  // Handle redirects based on auth state
  useEffect(() => {
    // Skip if still loading or refreshing
    if (isLoading) return;
    
    // If user is not authenticated after loading is complete and refresh attempt, redirect to auth
    if (!user) {
      console.log('User not authenticated, redirecting to auth page');
      navigate('/auth', { state: { from: location.pathname }, replace: true });
      return;
    }
    
    // If user is authenticated but onboarding is not complete, redirect to onboarding
    if (user && isOnboardingComplete === false && !location.pathname.includes('/onboarding')) {
      console.log('User authenticated but onboarding not complete, redirecting to onboarding');
      navigate('/onboarding', { replace: true });
    }
  }, [user, isLoading, isOnboardingComplete, location.pathname, navigate, hasAttemptedRefresh]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-love-50 via-harmony-50 to-calm-50">
        <Loader2 className="h-10 w-10 text-love-500 animate-spin mb-4" />
        <p className="text-harmony-700">Authenticating...</p>
      </div>
    );
  }

  // If user is not authenticated (after loading completed), don't render anything
  // The useEffect above will handle the redirect
  if (!user) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
