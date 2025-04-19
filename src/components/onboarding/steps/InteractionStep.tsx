
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { OnboardingFormData } from '@/hooks/useOnboardingForm';

interface InteractionStepProps {
  formData: OnboardingFormData;
  handleChange: (field: string, value: any) => void;
}

const InteractionStep: React.FC<InteractionStepProps> = ({ formData, handleChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-none shadow-none">
        <CardContent className="px-0">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold gradient-heading mb-2">
                Connection Time ⌛
              </h2>
              <p className="text-gray-600">Let's understand how you connect with each other.</p>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Label>How often do you spend time together?</Label>
                <Select
                  value={formData.interaction_frequency || ''}
                  onValueChange={(value) => handleChange('interaction_frequency', value)}
                >
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="few_times_week">A few times a week</SelectItem>
                    <SelectItem value="occasionally">Occasionally</SelectItem>
                    <SelectItem value="rarely">Rarely</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Label>When do you feel most connected?</Label>
                <Select
                  value={formData.preferred_communication || ''}
                  onValueChange={(value) => handleChange('preferred_communication', value)}
                >
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue placeholder="Select connection type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_person">Talking in person</SelectItem>
                    <SelectItem value="texting">Texting</SelectItem>
                    <SelectItem value="voice_calls">Voice calls</SelectItem>
                    <SelectItem value="shared_activities">Shared activities</SelectItem>
                    <SelectItem value="being_together">Just being together</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default InteractionStep;
