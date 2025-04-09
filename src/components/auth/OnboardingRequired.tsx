
import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

type OnboardingRequiredProps = {
  children: React.ReactNode;
  mustBeIncomplete?: boolean;
};

const OnboardingRequired: React.FC<OnboardingRequiredProps> = ({ 
  children, 
  mustBeIncomplete = false 
}) => {
  const { isOnboardingComplete, isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is not authenticated, redirect to auth page
    if (!isLoading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [isLoading, user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-love-50 via-harmony-50 to-calm-50">
        <Loader2 className="h-10 w-10 text-love-500 animate-spin mb-4" />
        <p className="text-harmony-700">Loading your profile...</p>
      </div>
    );
  }

  // If user is not authenticated (after loading completed), don't render anything
  // The useEffect above will handle the redirect
  if (!user) {
    return null;
  }

  // If mustBeIncomplete is true, then only allow access if onboarding is NOT complete
  // If mustBeIncomplete is false, then only allow access if onboarding IS complete
  if (mustBeIncomplete ? isOnboardingComplete : !isOnboardingComplete) {
    return <Navigate to={isOnboardingComplete ? '/dashboard' : '/onboarding'} replace />;
  }

  return <>{children}</>;
};

export default OnboardingRequired;
