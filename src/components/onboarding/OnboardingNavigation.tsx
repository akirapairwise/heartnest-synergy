
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, SkipForward, LogOut, Loader2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { useAuth } from '@/contexts/AuthContext';

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
  const { signOut } = useAuth();
  
  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    await onComplete(e);
  };
  
  const handleCancelOnboarding = () => {
    navigate('/auth');
  };
  
  const handleSignOut = async () => {
    await signOut();
  };
  
  return (
    <div className="flex justify-between p-4">
      {currentStep > 1 ? (
        <Button variant="outline" onClick={onPrev} className="flex items-center gap-2" disabled={isLoading}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      ) : (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Cancel Onboarding</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel the onboarding process? You can return later to complete your profile.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
              <DialogClose asChild>
                <Button variant="outline" className="w-full sm:w-auto">Continue Onboarding</Button>
              </DialogClose>
              <Button 
                variant="secondary" 
                onClick={handleCancelOnboarding} 
                className="w-full sm:w-auto"
              >
                Return to Login
              </Button>
              <Button 
                variant="destructive"
                onClick={handleSignOut}
                className="w-full sm:w-auto flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      <div className="flex gap-2">
        {currentStep < totalSteps && (
          <Button variant="outline" onClick={onSkip} className="flex items-center gap-2" disabled={isLoading}>
            Skip <SkipForward className="h-4 w-4" />
          </Button>
        )}
        
        {currentStep < totalSteps ? (
          <Button className="btn-primary-gradient" onClick={onNext} disabled={isLoading}>
            Continue <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button 
            className="btn-primary-gradient" 
            onClick={handleComplete}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Setting up...
              </span>
            ) : (
              <span className="flex items-center">
                Complete Profile <Check className="ml-1 h-4 w-4" />
              </span>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default OnboardingNavigation;
