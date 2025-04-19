
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
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { OnboardingFormData } from '@/hooks/useOnboardingForm';

interface RelationshipStatusStepProps {
  formData: OnboardingFormData;
  handleChange: (field: string, value: any) => void;
}

const RelationshipStatusStep: React.FC<RelationshipStatusStepProps> = ({ 
  formData, 
  handleChange 
}) => {
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
                Tell us about your relationship 💑
              </h2>
              <p className="text-gray-600">This helps us personalize your experience.</p>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Label>How would you describe your relationship?</Label>
                <Select
                  value={formData.relationship_status || ''}
                  onValueChange={(value) => handleChange('relationship_status', value)}
                >
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue placeholder="Select relationship status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dating">Dating</SelectItem>
                    <SelectItem value="engaged">Engaged</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="committed">Long-Term Committed</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Label>When did your relationship begin?</Label>
                <p className="text-xs text-muted-foreground mb-1">
                  Even an estimate helps us celebrate milestones with you.
                </p>
                <Input
                  type="date"
                  value={formData.relationship_start_date || ''}
                  onChange={(e) => handleChange('relationship_start_date', e.target.value)}
                  className="mt-1"
                />
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RelationshipStatusStep;
