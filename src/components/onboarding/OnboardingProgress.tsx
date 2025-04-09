
import React from 'react';
import { Progress } from "@/components/ui/progress";

interface OnboardingProgressProps {
  totalSteps: number;
  currentStep: number;
  progress: number;
  goToStep: (step: number) => void;
  isStepSkipped: (stepNumber: number) => boolean;
}

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  totalSteps,
  currentStep,
  progress,
  goToStep,
  isStepSkipped
}) => {
  return (
    <div className="mt-4">
      <Progress value={progress} className="h-2" />
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <button 
            key={i}
            onClick={() => goToStep(i + 1)}
            className={`px-2 py-1 rounded transition-all ${
              i + 1 === currentStep ? 'text-primary font-medium' : 
              isStepSkipped(i + 1) ? 'text-amber-500' :
              i + 1 < currentStep ? 'text-muted-foreground' : 'text-muted'
            }`}
          >
            Step {i + 1} {isStepSkipped(i + 1) && '(Skipped)'}
          </button>
        ))}
      </div>
    </div>
  );
};

export default OnboardingProgress;
