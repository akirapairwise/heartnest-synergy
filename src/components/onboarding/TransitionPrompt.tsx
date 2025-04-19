
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, UserCog } from "lucide-react";

interface TransitionPromptProps {
  onContinue: () => void;
  onSkip: () => void;
}

const TransitionPrompt: React.FC<TransitionPromptProps> = ({ onContinue, onSkip }) => {
  return (
    <Card className="border-none shadow-none">
      <CardContent className="px-0">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Would you like to personalize Pairwise even more?
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              We can ask a few more optional questions to make your experience even more meaningful — or you can do this later from your profile settings.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Button 
                onClick={onContinue}
                className="btn-primary-gradient flex-1 gap-2"
              >
                Continue to Personalize <UserCog className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline"
                onClick={onSkip}
                className="flex-1 gap-2"
              >
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransitionPrompt;
