
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

type OnboardingRequiredProps = {
  children: React.ReactNode;
  mustBeIncomplete?: boolean;
};

const OnboardingRequired: React.FC<OnboardingRequiredProps> = ({ 
  children, 
  mustBeIncomplete = false 
}) => {
  const { isOnboardingComplete, isLoading } = useAuth();

  if (isLoading) {
    // You could display a loading spinner here
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // If mustBeIncomplete is true, then only allow access if onboarding is NOT complete
  // If mustBeIncomplete is false, then only allow access if onboarding IS complete
  if (mustBeIncomplete ? isOnboardingComplete : !isOnboardingComplete) {
    return <Navigate to={isOnboardingComplete ? '/dashboard' : '/onboarding'} replace />;
  }

  return <>{children}</>;
};

export default OnboardingRequired;
