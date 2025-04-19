
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Sparkles } from "lucide-react";
import { useOnboardingForm } from '@/hooks/useOnboardingForm';
import OnboardingProgress from './OnboardingProgress';
import OnboardingNavigation from './OnboardingNavigation';
import StepRenderer from './StepRenderer';

const OnboardingForm = () => {
  const totalSteps = 3;
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
    handleCompleteBasic,
    isStepSkipped
  } = useOnboardingForm(totalSteps);
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl gradient-heading">Set Up Your Relationship Space</CardTitle>
        <CardDescription>
          Tell us about your relationship to get the most out of Pairwise
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
            nextStep={nextStep}
            completeBasic={handleCompleteBasic}
            skipToComplete={handleComplete}
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
          showSkip={step !== 2} // Don't show skip on transition prompt
          showCompleteOnLastStep={true}
        />
      </CardFooter>
    </Card>
  );
};

export default OnboardingForm;
