
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OnboardingFormData } from '@/hooks/useOnboardingForm';

interface Step1BasicInfoProps {
  formData: OnboardingFormData;
  handleChange: (field: string, value: any) => void;
}

const Step1BasicInfo: React.FC<Step1BasicInfoProps> = ({ 
  formData, 
  handleChange 
}) => {
  return (
    <Card className="border-none shadow-none">
      <CardContent className="px-0">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Hi there 👋 Welcome to Pairwise
            </h2>
            <p className="text-sm text-gray-600">
              A space to grow stronger together, one check-in at a time. Let's begin with a few quick questions to set up your relationship space.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="full_name">What's your name?</Label>
              <Input
                id="full_name"
                value={formData.full_name || ''}
                onChange={(e) => handleChange('full_name', e.target.value)}
                placeholder="Your name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="pronouns">And if you'd like, your preferred pronouns?</Label>
              <Input
                id="pronouns"
                value={formData.pronouns || ''}
                onChange={(e) => handleChange('pronouns', e.target.value)}
                placeholder="e.g., she/her, he/him, they/them"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="relationship_status">How would you describe your relationship?</Label>
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
            </div>

            <div>
              <Label htmlFor="relationship_start_date">Do you remember when your relationship started?</Label>
              <p className="text-xs text-muted-foreground mb-1">Even an estimate helps us celebrate meaningful milestones with you.</p>
              <Input
                id="relationship_start_date"
                type="date"
                value={formData.relationship_start_date || ''}
                onChange={(e) => handleChange('relationship_start_date', e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="living_together">Are you currently living together?</Label>
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
            </div>

            <div>
              <Label htmlFor="interaction_frequency">How often do you spend time together?</Label>
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
            </div>

            <div>
              <Label htmlFor="preferred_communication">When you feel most connected, what kind of interaction is happening?</Label>
              <Select
                value={formData.preferred_communication || ''}
                onValueChange={(value) => handleChange('preferred_communication', value)}
              >
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue placeholder="Select communication preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_person">Talking in person</SelectItem>
                  <SelectItem value="texting">Texting</SelectItem>
                  <SelectItem value="voice_calls">Voice calls</SelectItem>
                  <SelectItem value="shared_activities">Shared activities</SelectItem>
                  <SelectItem value="being_together">Just being together</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="areas_to_improve">If you could grow just one or two areas of your relationship, what would they be?</Label>
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
            </div>
          </div>

          <Separator />
          
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Great! We've set the foundation for your journey.
            </h3>
            <p className="text-sm text-gray-600">
              This helps Pairwise tailor check-ins, goals, and advice that truly fit your relationship.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Step1BasicInfo;
