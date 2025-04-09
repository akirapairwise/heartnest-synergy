
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingForm from '@/components/onboarding/OnboardingForm';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";

const OnboardingPage = () => {
  const { isOnboardingComplete, profile } = useAuth();
  const navigate = useNavigate();
  
  // Add effect to handle redirection when onboarding is completed
  useEffect(() => {
    if (isOnboardingComplete && profile) {
      toast.success("Onboarding completed! Welcome to your dashboard.");
      navigate('/dashboard', { replace: true });
    }
  }, [isOnboardingComplete, profile, navigate]);

  return (
    <div className="min-h-screen py-6 sm:py-12 px-4 bg-gradient-to-br from-love-50 via-harmony-50 to-calm-50">
      <div className="container mx-auto max-w-4xl">
        <OnboardingForm />
      </div>
    </div>
  );
};

export default OnboardingPage;
