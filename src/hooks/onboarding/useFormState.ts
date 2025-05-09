
import { useState, useEffect } from 'react';
import { OnboardingFormData, initialFormData } from '@/types/onboarding';

export const useFormState = (totalSteps: number) => {
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [skippedSteps, setSkippedSteps] = useState<number[]>([]);
  const [formData, setFormData] = useState<OnboardingFormData>(initialFormData);
  
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
  };

  const goToStep = (stepNumber: number) => {
    if (stepNumber >= 1 && stepNumber <= totalSteps) {
      setStep(stepNumber);
      window.scrollTo(0, 0);
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
    setIsLoading,
    handleChange,
    handleNestedChange,
    nextStep,
    prevStep,
    skipStep,
    goToStep,
    isStepSkipped,
    setFormData
  };
};
