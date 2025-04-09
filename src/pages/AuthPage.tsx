
import React, { useEffect, useState } from 'react';
import AuthForm from '@/components/auth/AuthForm';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const AuthPage = () => {
  const { user, isLoading, isOnboardingComplete } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pageLoading, setPageLoading] = useState(true);
  
  // Get the returnUrl from query params (if any)
  const getReturnUrl = () => {
    const params = new URLSearchParams(location.search);
    return params.get('returnUrl') || '/dashboard';
  };

  useEffect(() => {
    // Only redirect if loading is complete and we have authentication information
    if (!isLoading) {
      setPageLoading(false);
      
      if (user) {
        // If user is authenticated, redirect to appropriate page
        const returnUrl = getReturnUrl();
        const redirectPath = isOnboardingComplete ? returnUrl : '/onboarding';
        navigate(redirectPath, { replace: true });
      }
    }
  }, [user, isLoading, isOnboardingComplete, navigate, location.search]);

  // Show loading screen while checking authentication
  if (isLoading || pageLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-love-50 via-harmony-50 to-calm-50 p-4">
        <Loader2 className="h-10 w-10 text-love-500 animate-spin mb-4" />
        <p className="text-harmony-700">Getting everything ready...</p>
      </div>
    );
  }

  // Only show auth form if user is not authenticated
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-love-50 via-harmony-50 to-calm-50 p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-love-700 mb-6 hidden md:block">HeartNest</h1>
        <AuthForm />
        <p className="text-center text-gray-500 text-sm mt-6">
          Nurture your relationships with our thoughtfully designed tools
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
