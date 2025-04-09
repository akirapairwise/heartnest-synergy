
import React from 'react';
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles } from "lucide-react";

interface Step5Props {
  formData: any;
  handleChange: (field: string, value: any) => void;
  handleNestedChange: (parentField: string, field: string, value: any) => void;
}

const Step5Preferences: React.FC<Step5Props> = ({ 
  formData, 
  handleChange,
  handleNestedChange 
}) => {
  const { notification_preferences = { reminders: true, tips: true, partner_updates: true } } = formData;
  
  return (
    <>
      <h3 className="text-lg font-medium mb-4">Personalize Your Experience</h3>
      
      <div className="space-y-6">
        <div className="space-y-4">
          <Label className="text-base">Communication Frequency Preferences</Label>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="daily" 
              checked={formData.comm_frequency === 'daily'} 
              onCheckedChange={() => handleChange('comm_frequency', 'daily')}
            />
            <Label htmlFor="daily" className="text-sm">Daily check-ins</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="few-times" 
              checked={formData.comm_frequency === 'few-times'} 
              onCheckedChange={() => handleChange('comm_frequency', 'few-times')}
            />
            <Label htmlFor="few-times" className="text-sm">A few times a week</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="weekly" 
              checked={formData.comm_frequency === 'weekly'} 
              onCheckedChange={() => handleChange('comm_frequency', 'weekly')}
            />
            <Label htmlFor="weekly" className="text-sm">Weekly</Label>
          </div>
        </div>
        
        <div className="space-y-4">
          <Label>Notification Preferences</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="reminders" 
                checked={notification_preferences.reminders} 
                onCheckedChange={(checked) => 
                  handleNestedChange('notification_preferences', 'reminders', checked === true)
                }
              />
              <Label htmlFor="reminders" className="text-sm">Daily relationship reminders</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="tips" 
                checked={notification_preferences.tips} 
                onCheckedChange={(checked) => 
                  handleNestedChange('notification_preferences', 'tips', checked === true)
                }
              />
              <Label htmlFor="tips" className="text-sm">Relationship tips and advice</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="partner-updates" 
                checked={notification_preferences.partner_updates} 
                onCheckedChange={(checked) => 
                  handleNestedChange('notification_preferences', 'partner_updates', checked === true)
                }
              />
              <Label htmlFor="partner-updates" className="text-sm">Partner activity updates</Label>
            </div>
          </div>
        </div>
        
        <div className="relative p-4 border rounded-lg bg-gradient-to-r from-harmony-50 to-love-50">
          <div className="absolute top-3 right-3">
            <Sparkles className="h-5 w-5 text-harmony-500" />
          </div>
          <h4 className="font-medium text-harmony-700">AI-Powered Insights</h4>
          <p className="text-sm text-muted-foreground mt-1">
            HeartNest uses AI to provide personalized relationship insights and recommendations.
          </p>
          <div className="mt-3 flex items-center space-x-2">
            <Checkbox 
              id="ai-consent" 
              checked={formData.ai_consent} 
              onCheckedChange={(checked) => handleChange('ai_consent', checked === true)}
            />
            <Label htmlFor="ai-consent" className="text-sm">I consent to AI-powered features</Label>
          </div>
        </div>
      </div>
    </>
  );
};

export default Step5Preferences;
