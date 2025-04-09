
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, ArrowRight, Check, SkipForward } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import Step1BasicInfo from './steps/Step1BasicInfo';
import Step2Communication from './steps/Step2Communication';
import Step3Relationship from './steps/Step3Relationship';
import Step4Emotional from './steps/Step4Emotional';
import Step5Preferences from './steps/Step5Preferences';

const OnboardingForm = () => {
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [skippedSteps, setSkippedSteps] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    location: "",
    bio: "",
    love_language: "",
    communication_style: "",
    emotional_needs: "",
    relationship_goals: "",
    financial_attitude: "",
    notification_preferences: {
      reminders: true,
      tips: true,
      partner_updates: true
    },
    ai_consent: true
  });
  
  const totalSteps = 5;
  const { toast } = useToast();
  const navigate = useNavigate();
  const { updateProfile } = useAuth();
  
  useEffect(() => {
    // Update progress based on current step
    const calculatedProgress = (step / totalSteps) * 100;
    setProgress(calculatedProgress);
  }, [step]);

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
    
    toast({
      title: "Step skipped",
      description: "You can always come back to complete this step later.",
    });
  };

  const goToStep = (stepNumber: number) => {
    if (stepNumber >= 1 && stepNumber <= totalSteps) {
      setStep(stepNumber);
      window.scrollTo(0, 0);
    }
  };
  
  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const profileData = {
        love_language: formData.love_language,
        communication_style: formData.communication_style,
        emotional_needs: formData.emotional_needs,
        relationship_goals: formData.relationship_goals,
        financial_attitude: formData.financial_attitude,
        is_onboarding_complete: true
      };
      
      await updateProfile(profileData);
      
      toast({
        title: "Profile completed!",
        description: "Your profile has been set up. You're ready to start your relationship journey.",
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "There was a problem saving your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to check if a step is skipped
  const isStepSkipped = (stepNumber: number) => {
    return skippedSteps.includes(stepNumber);
  };
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl gradient-heading">Let's Set Up Your Profile</CardTitle>
        <CardDescription>
          Tell us about yourself to get the most out of HeartNest
        </CardDescription>
        <div className="mt-4">
          <Progress value={progress} className="h-2" />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <button 
                key={i}
                onClick={() => goToStep(i + 1)}
                className={`px-2 py-1 rounded transition-all ${
                  i + 1 === step ? 'text-primary font-medium' : 
                  isStepSkipped(i + 1) ? 'text-amber-500' :
                  i + 1 < step ? 'text-muted-foreground' : 'text-muted'
                }`}
              >
                Step {i + 1} {isStepSkipped(i + 1) && '(Skipped)'}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4 animate-fade-in">
          {step === 1 && (
            <Step1BasicInfo 
              formData={formData} 
              handleChange={handleChange} 
            />
          )}
          
          {step === 2 && (
            <Step2Communication 
              formData={formData} 
              handleChange={handleChange} 
            />
          )}
          
          {step === 3 && (
            <Step3Relationship 
              formData={formData} 
              handleChange={handleChange} 
            />
          )}
          
          {step === 4 && (
            <Step4Emotional 
              formData={formData} 
              handleChange={handleChange} 
            />
          )}
          
          {step === 5 && (
            <Step5Preferences 
              formData={formData} 
              handleChange={handleChange} 
              handleNestedChange={handleNestedChange} 
            />
          )}
        </div>
      </CardContent>
      
      <Separator className="my-2" />
      
      <CardFooter className="flex justify-between p-4">
        {step > 1 ? (
          <Button variant="outline" onClick={prevStep} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        ) : (
          <Button variant="outline" onClick={() => navigate('/auth')}>
            Cancel
          </Button>
        )}
        
        <div className="flex gap-2">
          {step < totalSteps && (
            <Button variant="outline" onClick={skipStep} className="flex items-center gap-2">
              Skip <SkipForward className="h-4 w-4" />
            </Button>
          )}
          
          {step < totalSteps ? (
            <Button className="btn-primary-gradient" onClick={nextStep}>
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
      </CardFooter>
    </Card>
  );
};

export default OnboardingForm;
