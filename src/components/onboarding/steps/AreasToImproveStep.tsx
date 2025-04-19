
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

interface AreasToImproveStepProps {
  formData: OnboardingFormData;
  handleChange: (field: string, value: any) => void;
}

const AreasToImproveStep: React.FC<AreasToImproveStepProps> = ({ formData, handleChange }) => {
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
                Growth Together 🌱
              </h2>
              <p className="text-gray-600">
                What would you like to focus on improving in your relationship?
              </p>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Label>Choose an area to grow together</Label>
                <Select
                  value={formData.areas_to_improve?.[0] || ''}
                  onValueChange={(value) => handleChange('areas_to_improve', [value])}
                >
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue placeholder="Select area to improve" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trust">Trust</SelectItem>
                    <SelectItem value="fun">Fun</SelectItem>
                    <SelectItem value="emotional_intimacy">Emotional Intimacy</SelectItem>
                    <SelectItem value="communication">Communication</SelectItem>
                    <SelectItem value="conflict_resolution">Conflict Resolution</SelectItem>
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

export default AreasToImproveStep;
