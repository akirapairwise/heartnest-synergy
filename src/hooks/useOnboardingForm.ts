
import { useFormState } from './onboarding/useFormState';
import { useProfileCompletion } from './onboarding/useProfileCompletion';
import { OnboardingFormData } from '@/types/onboarding';

export type { OnboardingFormData };

export const useOnboardingForm = (totalSteps: number) => {
  // Use the form state management hook
  const {
    step,
    progress,
    isLoading,
    formData,
    skippedSteps,
    setIsLoading,
    handleChange,
    handleNestedChange,
    nextStep,
    prevStep,
    skipStep,
    goToStep,
    isStepSkipped
  } = useFormState(totalSteps);
  
  // Use the profile completion hook
  const { 
    handleComplete, 
    handleCompleteBasic 
  } = useProfileCompletion(setIsLoading, formData);

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
