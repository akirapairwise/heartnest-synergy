
import React from 'react';
import { OnboardingFormData } from '@/hooks/useOnboardingForm';
import TransitionPrompt from './TransitionPrompt';
import WelcomeStep from './steps/WelcomeStep';
import NameStep from './steps/NameStep';
import RelationshipStatusStep from './steps/RelationshipStatusStep';
import LivingStep from './steps/LivingStep';
import InteractionStep from './steps/InteractionStep';
import AreasToImproveStep from './steps/AreasToImproveStep';

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
      return <WelcomeStep onNext={nextStep} />;
    case 2:
      return <NameStep formData={formData} handleChange={handleChange} />;
    case 3:
      return <RelationshipStatusStep formData={formData} handleChange={handleChange} />;
    case 4:
      return <LivingStep formData={formData} handleChange={handleChange} />;
    case 5:
      return <InteractionStep formData={formData} handleChange={handleChange} />;
    case 6:
      return <AreasToImproveStep formData={formData} handleChange={handleChange} />;
    case 7:
      return (
        <TransitionPrompt 
          onContinue={() => skipToComplete(new Event('submit') as React.FormEvent)} 
          onSkip={completeBasic} 
        />
      );
    default:
      return null;
  }
};

export default StepRenderer;
