
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingForm from '@/components/onboarding/OnboardingForm';
import { useAuth } from '@/contexts/AuthContext';

const OnboardingPage = () => {
  const { isOnboardingComplete } = useAuth();
  const navigate = useNavigate();
  
  // Add effect to handle redirection when onboarding is completed
  useEffect(() => {
    if (isOnboardingComplete) {
      navigate('/dashboard', { replace: true });
    }
  }, [isOnboardingComplete, navigate]);

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-love-50 via-harmony-50 to-calm-50">
      <div className="container mx-auto">
        <OnboardingForm />
      </div>
    </div>
  );
};

export default OnboardingPage;
