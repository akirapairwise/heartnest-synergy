
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OnboardingFormData } from '@/hooks/useOnboardingForm';

interface Step2PersonalizationProps {
  formData: OnboardingFormData;
  handleChange: (field: string, value: any) => void;
}

const Step2Personalization: React.FC<Step2PersonalizationProps> = ({ 
  formData, 
  handleChange 
}) => {
  return (
    <Card className="border-none shadow-none">
      <CardContent className="px-0">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Let's personalize your experience
            </h2>
            <p className="text-sm text-gray-600">
              These additional details will help us create a more tailored experience for your relationship journey.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="love_language_preference">How do you most feel loved?</Label>
              <Select
                value={formData.love_language_preference || ''}
                onValueChange={(value) => handleChange('love_language_preference', value)}
              >
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue placeholder="Select your love language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="words_of_affirmation">Words of affirmation</SelectItem>
                  <SelectItem value="acts_of_service">Acts of service</SelectItem>
                  <SelectItem value="receiving_gifts">Receiving gifts</SelectItem>
                  <SelectItem value="quality_time">Quality time</SelectItem>
                  <SelectItem value="physical_touch">Physical touch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="conflict_resolution_style">When tension happens, what feels most helpful?</Label>
              <Select
                value={formData.conflict_resolution_style || ''}
                onValueChange={(value) => handleChange('conflict_resolution_style', value)}
              >
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue placeholder="Select conflict resolution style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="talk_quickly">Talking it out quickly</SelectItem>
                  <SelectItem value="need_space">Needing space first</SelectItem>
                  <SelectItem value="avoid_issue">Avoiding the issue</SelectItem>
                  <SelectItem value="calm_steps">Calm step-by-step conversations</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="shared_goals">What are some dreams or goals you'd love to work toward together?</Label>
              <p className="text-xs text-muted-foreground mb-1">Select all that apply</p>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {['travel', 'home', 'business', 'family', 'education', 'health', 'finances'].map(goal => (
                  <label 
                    key={goal} 
                    className={`
                      flex items-center p-2 rounded-md border cursor-pointer transition-colors
                      ${formData.shared_goals?.includes(goal) 
                        ? 'bg-primary/10 border-primary' 
                        : 'bg-background border-input hover:bg-accent hover:text-accent-foreground'}
                    `}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={formData.shared_goals?.includes(goal) || false}
                      onChange={(e) => {
                        const currentGoals = formData.shared_goals || [];
                        if (e.target.checked) {
                          handleChange('shared_goals', [...currentGoals, goal]);
                        } else {
                          handleChange('shared_goals', currentGoals.filter(g => g !== goal));
                        }
                      }}
                    />
                    <span className="capitalize">{goal.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <Separator />
          
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Thanks for sharing these
            </h3>
            <p className="text-sm text-gray-600">
              You've now built a truly personalized Pairwise experience 💜 Let's get started.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Step2Personalization;
