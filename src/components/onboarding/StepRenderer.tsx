
import React from 'react';
import { OnboardingFormData } from '@/hooks/useOnboardingForm';
import Step1BasicInfo from './steps/Step1BasicInfo';
import Step2Communication from './steps/Step2Communication';
import Step3Relationship from './steps/Step3Relationship';
import Step4Emotional from './steps/Step4Emotional';
import Step5Preferences from './steps/Step5Preferences';

interface StepRendererProps {
  step: number;
  formData: OnboardingFormData;
  handleChange: (field: string, value: any) => void;
  handleNestedChange: (parentField: string, field: string, value: any) => void;
}

const StepRenderer: React.FC<StepRendererProps> = ({
  step,
  formData,
  handleChange,
  handleNestedChange
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
        <Step2Communication 
          formData={formData} 
          handleChange={handleChange} 
        />
      );
    case 3:
      return (
        <Step3Relationship 
          formData={formData} 
          handleChange={handleChange} 
        />
      );
    case 4:
      return (
        <Step4Emotional 
          formData={formData} 
          handleChange={handleChange} 
        />
      );
    case 5:
      return (
        <Step5Preferences 
          formData={formData} 
          handleChange={handleChange} 
          handleNestedChange={handleNestedChange} 
        />
      );
    default:
      return null;
  }
};

export default StepRenderer;
