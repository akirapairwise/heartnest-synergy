
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type OnboardingFormData = {
  full_name: string;
  nickname: string;
  location: string;
  bio: string;
  love_language: string;
  communication_style: string;
  emotional_needs: string;
  relationship_goals: string;
  financial_attitude: string;
  notification_preferences: {
    reminders: boolean;
    tips: boolean;
    partner_updates: boolean;
  };
  ai_consent: boolean;
  // New relationship profile fields
  pronouns?: string;
  relationship_status?: string;
  relationship_start_date?: string;
  living_together?: string;
  interaction_frequency?: string;
  preferred_communication?: string;
  areas_to_improve?: string[];
  // Optional personalization
  love_language_preference?: string;
  conflict_resolution_style?: string;
  shared_goals?: string[];
  [key: string]: any;
};

export const useOnboardingForm = (totalSteps: number) => {
  
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [skippedSteps, setSkippedSteps] = useState<number[]>([]);
  const [formData, setFormData] = useState<OnboardingFormData>({
    full_name: "",
    nickname: "",
    location: "",
    bio: "",
    love_language: "",
    communication_style: "",
    emotional_needs: "",
    relationship_goals: "",
    financial_attitude: "",
    notification_preferences: {
      reminders: true,
      tips: true,
      partner_updates: true
    },
    ai_consent: true,
    // New relationship profile fields with defaults
    pronouns: "",
    relationship_status: "",
    relationship_start_date: "",
    living_together: "",
    interaction_frequency: "",
    preferred_communication: "",
    areas_to_improve: [],
    // Optional personalization
    love_language_preference: "",
    conflict_resolution_style: "",
    shared_goals: []
  });
  
  const { toast: useToastHook } = useToast();
  const navigate = useNavigate();
  const { updateProfile, fetchUserProfile, user } = useAuth();
  
  useEffect(() => {
    // Update progress based on current step
    const calculatedProgress = (step / totalSteps) * 100;
    setProgress(calculatedProgress);
  }, [step, totalSteps]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleNestedChange = (parentField: string, field: string, value: any) => {
    
    setFormData(prev => {
      // Ensure the parent field exists and is an object before spreading it
      const parentValue = prev[parentField as keyof typeof prev] || {};
      
      // Check if parentValue is an object before using spread
      if (typeof parentValue === 'object' && parentValue !== null) {
        return {
          ...prev,
          [parentField]: {
            ...parentValue,
            [field]: value
          }
        };
      }
      
      // Fallback if parentValue is not an object
      return {
        ...prev,
        [parentField]: { [field]: value }
      };
    });
  };
  
  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };
  
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };

  const skipStep = () => {
    
    // Mark current step as skipped if it's not already in the skipped steps array
    if (!skippedSteps.includes(step)) {
      setSkippedSteps([...skippedSteps, step]);
    }
    
    // Move to the next step
    if (step < totalSteps) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
    
    toast.info("Step skipped", {
      description: "You can always come back to complete this step later."
    });
  };

  const goToStep = (stepNumber: number) => {
    if (stepNumber >= 1 && stepNumber <= totalSteps) {
      setStep(stepNumber);
      window.scrollTo(0, 0);
    }
  };
  
  // Complete with both basic and personalization data
  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Verify user is authenticated before proceeding
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        toast.error("Authentication error", {
          description: "You must be logged in to complete your profile.",
          duration: 3000
        });
        navigate('/auth', { replace: true });
        return;
      }
      
      // Collect all relevant profile data from the form
      const profileData = {
        location: formData.location || null,
        bio: formData.bio || null,
        love_language: formData.love_language || null,
        communication_style: formData.communication_style || null,
        emotional_needs: formData.emotional_needs || null,
        relationship_goals: formData.relationship_goals || null,
        financial_attitude: formData.financial_attitude || null,
        // New relationship fields
        pronouns: formData.pronouns || null,
        relationship_status: formData.relationship_status || null,
        relationship_start_date: formData.relationship_start_date || null,
        living_together: formData.living_together || null,
        interaction_frequency: formData.interaction_frequency || null,
        preferred_communication: formData.preferred_communication || null,
        areas_to_improve: formData.areas_to_improve || null,
        // Optional personalization
        love_language_preference: formData.love_language_preference || null,
        conflict_resolution_style: formData.conflict_resolution_style || null,
        shared_goals: formData.shared_goals || null,
        // Mark complete stage
        profile_complete_stage: 'complete',
        // Explicitly set the onboarding flag to true
        is_onboarding_complete: true
      };
      
      // Update the profile with all collected data
      const updateResult = await updateProfile(profileData);
      
      if (updateResult?.error) {
        throw new Error(updateResult.error.message || "Failed to update profile");
      }
      
      // Show success toast with longer duration
      toast.success("Profile completed!", {
        description: "Your profile has been set up. Redirecting to your dashboard...",
        duration: 3000
      });
      
      // Refetch the user profile to confirm the update
      if (user) {
        try {
          await fetchUserProfile(user.id);
          
          // Verify that is_onboarding_complete is actually true after fetching
          const { data: profileCheck, error: profileCheckError } = await supabase
            .from('user_profiles')
            .select('is_onboarding_complete')
            .eq('id', user.id)
            .single();
            
          if (profileCheckError) {
            console.error('Error verifying profile update:', profileCheckError);
            // Even if verification fails, still redirect to dashboard
            navigate('/dashboard', { replace: true });
          } else if (!profileCheck?.is_onboarding_complete) {
            console.warn('Profile update may not have been saved correctly');
            // Still redirect to dashboard but update the profile again
            const retryUpdate = await supabase
              .from('user_profiles')
              .update({ is_onboarding_complete: true })
              .eq('id', user.id);
              
            if (retryUpdate.error) {
              console.error('Error on retry update:', retryUpdate.error);
            }
            
            navigate('/dashboard', { replace: true });
          } else {
            // Normal successful path
            navigate('/dashboard', { replace: true });
          }
        } catch (fetchError) {
          console.error('Error refetching profile after update:', fetchError);
          // Even if verification fails, still redirect to dashboard but show a warning
          toast.warning("Profile updated", { 
            description: "Redirecting to dashboard, but please refresh if you encounter any issues.",
            duration: 4000
          });
          navigate('/dashboard', { replace: true });
        }
      } else {
        // Fallback if user is not available
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      useToastHook({
        title: "Error",
        description: error instanceof Error ? error.message : "There was a problem saving your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Complete with just basic data
  const handleCompleteBasic = async () => {
    setIsLoading(true);
    
    try {
      // Verify user is authenticated before proceeding
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        toast.error("Authentication error", {
          description: "You must be logged in to complete your profile.",
          duration: 3000
        });
        navigate('/auth', { replace: true });
        return;
      }
      
      // Collect basic profile data
      const profileData = {
        full_name: formData.full_name || null,
        pronouns: formData.pronouns || null,
        relationship_status: formData.relationship_status || null,
        relationship_start_date: formData.relationship_start_date || null,
        living_together: formData.living_together || null,
        interaction_frequency: formData.interaction_frequency || null,
        preferred_communication: formData.preferred_communication || null,
        areas_to_improve: formData.areas_to_improve || null,
        // Mark complete stage
        profile_complete_stage: 'basic',
        // Explicitly set the onboarding flag to true
        is_onboarding_complete: true
      };
      
      // Update the profile with basic data
      const updateResult = await updateProfile(profileData);
      
      if (updateResult?.error) {
        throw new Error(updateResult.error.message || "Failed to update profile");
      }
      
      // Show success toast with longer duration
      toast.success("Profile basics completed!", {
        description: "Your profile has been set up. You can complete personalization later in profile settings.",
        duration: 3000
      });
      
      // Navigate to dashboard
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Error", {
        description: error instanceof Error ? error.message : "There was a problem saving your profile. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to check if a step is skipped
  const isStepSkipped = (stepNumber: number) => {
    return skippedSteps.includes(stepNumber);
  };

  return {
    step,
    progress,
    isLoading,
    formData,
    skippedSteps,
    handleChange,
    handleNestedChange,
    nextStep,
    prevStep,
    skipStep,
    goToStep,
    handleComplete,
    handleCompleteBasic,
    isStepSkipped,
    totalSteps
  };
};
