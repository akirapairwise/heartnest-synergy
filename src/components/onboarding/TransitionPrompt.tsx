
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, UserCog } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface TransitionPromptProps {
  onContinue: (e: React.FormEvent) => void;
  onSkip: () => void;
}

const TransitionPrompt: React.FC<TransitionPromptProps> = ({ onContinue, onSkip }) => {
  const navigate = useNavigate();
  
  const handleGoToDashboard = () => {
    onSkip();
  };
  
  const handleGoToSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onContinue(e);
    // The navigate will happen in the handleCompleteBasic function after profile update
  };

  return (
    <Card className="border-none shadow-none bg-gradient-to-br from-love-50 via-harmony-50 to-calm-50">
      <CardContent className="px-4 py-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Would you like to personalize HeartNest even more?
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              We can ask a few more optional questions to make your experience even more meaningful — or you can do this later from your profile settings.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button 
                onClick={handleGoToSettings}
                className="btn-primary-gradient flex-1 gap-2 shadow-md hover:shadow-lg transition-all"
              >
                Continue to Personalize <UserCog className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline"
                onClick={handleGoToDashboard}
                className="flex-1 gap-2 shadow-sm hover:shadow transition-all"
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
