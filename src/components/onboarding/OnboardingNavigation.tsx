
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, SkipForward } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface OnboardingNavigationProps {
  currentStep: number;
  totalSteps: number;
  isLoading: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSkip: () => void;
  onComplete: (e: React.FormEvent) => Promise<void>;
}

const OnboardingNavigation: React.FC<OnboardingNavigationProps> = ({
  currentStep,
  totalSteps,
  isLoading,
  onPrev,
  onNext,
  onSkip,
  onComplete
}) => {
  const navigate = useNavigate();
  
  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    await onComplete(e);
    // Navigation is now handled directly in the handleComplete function in useOnboardingForm
  };
  
  return (
    <div className="flex justify-between p-4">
      {currentStep > 1 ? (
        <Button variant="outline" onClick={onPrev} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      ) : (
        <Button variant="outline" onClick={() => navigate('/auth')}>
          Cancel
        </Button>
      )}
      
      <div className="flex gap-2">
        {currentStep < totalSteps && (
          <Button variant="outline" onClick={onSkip} className="flex items-center gap-2">
            Skip <SkipForward className="h-4 w-4" />
          </Button>
        )}
        
        {currentStep < totalSteps ? (
          <Button className="btn-primary-gradient" onClick={onNext}>
            Continue <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button 
            className="btn-primary-gradient" 
            onClick={handleComplete}
            disabled={isLoading}
          >
            {isLoading ? (
              <>Setting up...</>
            ) : (
              <>Complete Profile <Check className="ml-1 h-4 w-4" /></>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default OnboardingNavigation;
