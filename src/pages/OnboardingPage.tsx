
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingForm from '@/components/onboarding/OnboardingForm';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const OnboardingPage = () => {
  const { isOnboardingComplete, profile, isLoading, user, fetchUserProfile } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const navigate = useNavigate();
  
  useDocumentTitle('Complete Your Profile | Pairwise');

  // Verify authentication and check onboarding status
  useEffect(() => {
    async function checkAuth() {
      try {
        setIsVerifying(true);
        // Verify current auth state directly from Supabase
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();
        
        if (error || !currentUser) {
          toast.error("Authentication required", { 
            description: "Please log in to continue.",
            duration: 3000
          });
          navigate('/auth', { replace: true });
          return;
        }
        
        // If we have a user but no profile data, try to fetch it
        if (currentUser && !profile && !isLoading) {
          try {
            await fetchUserProfile(currentUser.id);
          } catch (error) {
            console.error("Error fetching profile:", error);
            toast.error("Error loading profile", {
              description: "Please try again or contact support.",
              duration: 3000
            });
          }
        }
      } catch (err) {
        console.error("Error in auth verification:", err);
        toast.error("Authentication error", {
          description: "Please try logging in again.",
          duration: 3000
        });
        navigate('/auth', { replace: true });
      } finally {
        setIsVerifying(false);
      }
    }
    
    checkAuth();
  }, [user, profile, navigate, fetchUserProfile, isLoading]);
  
  // Handle redirection when onboarding is completed
  useEffect(() => {
    // Only redirect if we're done loading and know the onboarding status
    if (!isLoading && !isVerifying) {
      if (isOnboardingComplete) {
        toast.success("Onboarding already completed! Redirecting to dashboard.");
        navigate('/dashboard', { replace: true });
      } else if (!user) {
        // If no user is found, redirect to auth page
        toast.error("Authentication required. Please log in.");
        navigate('/auth', { replace: true });
      }
    }
  }, [isOnboardingComplete, isLoading, isVerifying, navigate, user]);

  // Show loading UI
  if (isLoading || isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-love-50 via-harmony-50 to-calm-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-love-500 animate-spin mx-auto mb-4" />
          <p className="text-harmony-700">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // If onboarding is already complete or no user is found, don't render anything (handled by useEffect)
  if (isOnboardingComplete || !user) {
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
