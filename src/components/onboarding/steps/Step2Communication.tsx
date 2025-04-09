
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Step2Props {
  formData: any;
  handleChange: (field: string, value: any) => void;
}

const Step2Communication: React.FC<Step2Props> = ({ formData, handleChange }) => {
  return (
    <>
      <h3 className="text-lg font-medium mb-4">Communication Preferences</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="relationship-status">Current Relationship Status</Label>
          <Select 
            value={formData.relationship_status || ''} 
            onValueChange={(value) => handleChange('relationship_status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="dating">Dating</SelectItem>
              <SelectItem value="engaged">Engaged</SelectItem>
              <SelectItem value="married">Married</SelectItem>
              <SelectItem value="complicated">It's complicated</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="communication-style">Communication Style</Label>
          <Select 
            value={formData.communication_style || ''} 
            onValueChange={(value) => handleChange('communication_style', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="direct">Direct communicator</SelectItem>
              <SelectItem value="emotional">Emotional communicator</SelectItem>
              <SelectItem value="analytical">Analytical thinker</SelectItem>
              <SelectItem value="reserved">Reserved communicator</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">How do you typically express yourself in conversations?</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="love-languages">Primary Love Language</Label>
          <Select 
            value={formData.love_language || ''} 
            onValueChange={(value) => handleChange('love_language', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="words">Words of Affirmation</SelectItem>
              <SelectItem value="touch">Physical Touch</SelectItem>
              <SelectItem value="gifts">Receiving Gifts</SelectItem>
              <SelectItem value="time">Quality Time</SelectItem>
              <SelectItem value="service">Acts of Service</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">How you prefer to give and receive love</p>
        </div>
      </div>
    </>
  );
};

export default Step2Communication;
