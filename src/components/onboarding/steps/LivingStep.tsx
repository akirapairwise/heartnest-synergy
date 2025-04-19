
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

interface LivingStepProps {
  formData: OnboardingFormData;
  handleChange: (field: string, value: any) => void;
}

const LivingStep: React.FC<LivingStepProps> = ({ formData, handleChange }) => {
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
                Living Situation 🏠
              </h2>
              <p className="text-gray-600">Help us understand your daily dynamics.</p>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Label>Are you currently living together?</Label>
                <Select
                  value={formData.living_together || ''}
                  onValueChange={(value) => handleChange('living_together', value)}
                >
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue placeholder="Select living arrangement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="long_distance">Long-distance</SelectItem>
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

export default LivingStep;
