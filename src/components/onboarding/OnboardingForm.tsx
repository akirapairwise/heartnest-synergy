
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Sparkles } from "lucide-react";
import { useOnboardingForm } from '@/hooks/useOnboardingForm';
import OnboardingProgress from './OnboardingProgress';
import OnboardingNavigation from './OnboardingNavigation';
import StepRenderer from './StepRenderer';

const OnboardingForm = () => {
  const totalSteps = 5;
  const {
    step,
    progress,
    isLoading,
    formData,
    handleChange,
    handleNestedChange,
    nextStep,
    prevStep,
    skipStep,
    goToStep,
    handleComplete,
    isStepSkipped
  } = useOnboardingForm(totalSteps);
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl gradient-heading">Let's Set Up Your Profile</CardTitle>
        <CardDescription>
          Tell us about yourself to get the most out of HeartNest
        </CardDescription>
        <OnboardingProgress 
          totalSteps={totalSteps}
          currentStep={step}
          progress={progress}
          goToStep={goToStep}
          isStepSkipped={isStepSkipped}
        />
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4 animate-fade-in">
          <StepRenderer 
            step={step}
            formData={formData}
            handleChange={handleChange}
            handleNestedChange={handleNestedChange}
          />
        </div>
      </CardContent>
      
      <Separator className="my-2" />
      
      <CardFooter>
        <OnboardingNavigation 
          currentStep={step}
          totalSteps={totalSteps}
          isLoading={isLoading}
          onPrev={prevStep}
          onNext={nextStep}
          onSkip={skipStep}
          onComplete={handleComplete}
        />
      </CardFooter>
    </Card>
  );
};

export default OnboardingForm;
