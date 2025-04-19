
import React from 'react';
import { OnboardingFormData } from '@/hooks/useOnboardingForm';
import Step1BasicInfo from './steps/Step1BasicInfo';
import Step2Personalization from './steps/Step2Personalization';
import TransitionPrompt from './TransitionPrompt';

interface StepRendererProps {
  step: number;
  formData: OnboardingFormData;
  handleChange: (field: string, value: any) => void;
  handleNestedChange: (parentField: string, field: string, value: any) => void;
  nextStep: () => void;
  completeBasic: () => void;
  skipToComplete: (e: React.FormEvent) => Promise<void>;
}

const StepRenderer: React.FC<StepRendererProps> = ({
  step,
  formData,
  handleChange,
  handleNestedChange,
  nextStep,
  completeBasic,
  skipToComplete
}) => {
  switch (step) {
    case 1:
      return (
        <Step1BasicInfo 
          formData={formData} 
          handleChange={handleChange} 
        />
      );
    case 2:
      return (
        <TransitionPrompt 
          onContinue={nextStep} 
          onSkip={completeBasic} 
        />
      );
    case 3:
      return (
        <Step2Personalization 
          formData={formData} 
          handleChange={handleChange} 
        />
      );
    default:
      return null;
  }
};

export default StepRenderer;
