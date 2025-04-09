
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingForm from '@/components/onboarding/OnboardingForm';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";

const OnboardingPage = () => {
  const { isOnboardingComplete, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Add effect to handle redirection when onboarding is completed
  useEffect(() => {
    // Only redirect if we're done loading and know the onboarding status
    if (!isLoading) {
      if (isOnboardingComplete) {
        toast.success("Onboarding already completed! Redirecting to dashboard.");
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isOnboardingComplete, isLoading, navigate]);

  // Don't render the form until we know the user needs to complete onboarding
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-love-50 via-harmony-50 to-calm-50">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-love-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-harmony-700">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // If onboarding is already complete, don't render anything (handled by useEffect)
  if (isOnboardingComplete) {
    return null;
  }

  return (
    <div className="min-h-screen py-6 sm:py-12 px-4 bg-gradient-to-br from-love-50 via-harmony-50 to-calm-50">
      <div className="container mx-auto max-w-4xl">
        <OnboardingForm />
      </div>
    </div>
  );
};

export default OnboardingPage;
