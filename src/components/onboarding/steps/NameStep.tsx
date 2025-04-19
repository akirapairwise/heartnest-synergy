
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { OnboardingFormData } from '@/hooks/useOnboardingForm';

interface NameStepProps {
  formData: OnboardingFormData;
  handleChange: (field: string, value: any) => void;
}

const NameStep: React.FC<NameStepProps> = ({ formData, handleChange }) => {
  const pronounOptions = [
    { value: 'he/him', label: 'He/Him' },
    { value: 'she/her', label: 'She/Her' },
    { value: 'they/them', label: 'They/Them' },
    { value: 'ze/zir', label: 'Ze/Zir' },
    { value: 'other', label: 'Other/Prefer not to say' }
  ];

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
                Nice to meet you! 👋
              </h2>
              <p className="text-gray-600">Let's start with your name.</p>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Label htmlFor="full_name">What's your name?</Label>
                <Input
                  id="full_name"
                  value={formData.full_name || ''}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  placeholder="Your name"
                  className="mt-1"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Label htmlFor="pronouns">Your preferred pronouns</Label>
                <Select
                  value={formData.pronouns || ''}
                  onValueChange={(value) => handleChange('pronouns', value)}
                >
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue placeholder="Select your pronouns" />
                  </SelectTrigger>
                  <SelectContent>
                    {pronounOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
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

export default NameStep;
