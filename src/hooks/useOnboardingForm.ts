import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export type OnboardingFormData = {
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
  [key: string]: any;
};

export const useOnboardingForm = (totalSteps: number) => {
  
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [skippedSteps, setSkippedSteps] = useState<number[]>([]);
  const [formData, setFormData] = useState<OnboardingFormData>({
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
    ai_consent: true
  });
  
  const { toast: useToastHook } = useToast();
  const navigate = useNavigate();
  const { updateProfile } = useAuth();
  
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
    
    useToastHook({
      title: "Step skipped",
      description: "You can always come back to complete this step later.",
    });
  };

  const goToStep = (stepNumber: number) => {
    if (stepNumber >= 1 && stepNumber <= totalSteps) {
      setStep(stepNumber);
      window.scrollTo(0, 0);
    }
  };
  
  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const profileData = {
        love_language: formData.love_language,
        communication_style: formData.communication_style,
        emotional_needs: formData.emotional_needs,
        relationship_goals: formData.relationship_goals,
        financial_attitude: formData.financial_attitude,
        is_onboarding_complete: true
      };
      
      await updateProfile(profileData);
      
      // Use Sonner toast for better visibility
      toast.success("Profile completed!", {
        description: "Your profile has been set up. You're ready to start your relationship journey."
      });
      
      // Note: We don't need to navigate here as it will be handled by the OnboardingPage useEffect
    } catch (error) {
      console.error('Error updating profile:', error);
      useToastHook({
        title: "Error",
        description: "There was a problem saving your profile. Please try again.",
        variant: "destructive",
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
    isStepSkipped,
    totalSteps
  };
};
