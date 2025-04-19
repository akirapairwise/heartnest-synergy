
import React, { useEffect } from 'react';
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

  useEffect(() => {
    // If session appears to be expired, try refreshing it
    const checkAndRefreshSession = async () => {
      if (!user && !isLoading) {
        console.log('No user detected in protected route, attempting to refresh session');
        await refreshSession();
      }
    };
    
    checkAndRefreshSession();
  }, [refreshSession, user, isLoading]);

  useEffect(() => {
    // If user is still not authenticated after loading is complete and refresh attempt, redirect to auth
    if (!isLoading && !user) {
      console.log('User not authenticated, redirecting to auth page');
      navigate('/auth', { state: { from: location.pathname }, replace: true });
    }
    
    // If user is authenticated but onboarding is not complete, redirect to onboarding
    // Only redirect if not already on the onboarding page
    if (!isLoading && user && isOnboardingComplete === false && !location.pathname.includes('/onboarding')) {
      console.log('User authenticated but onboarding not complete, redirecting to onboarding');
      navigate('/onboarding', { replace: true });
    }
  }, [user, isLoading, isOnboardingComplete, location.pathname, navigate]);

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
