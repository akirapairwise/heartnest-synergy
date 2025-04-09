
import React from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Step3Props {
  formData: any;
  handleChange: (field: string, value: any) => void;
}

const Step3Relationship: React.FC<Step3Props> = ({ formData, handleChange }) => {
  return (
    <>
      <h3 className="text-lg font-medium mb-4">Relationship Goals</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="relationship-goals">What are your relationship goals?</Label>
          <Textarea 
            id="relationship-goals" 
            placeholder="What are you hoping to improve or achieve in your relationship?" 
            value={formData.relationship_goals || ''}
            onChange={(e) => handleChange('relationship_goals', e.target.value)}
            className="min-h-[100px]"
          />
          <p className="text-xs text-muted-foreground mt-1">Short and long-term goals you want to work on</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="commitment-level">Commitment Level</Label>
          <Select 
            value={formData.commitment_level || ''} 
            onValueChange={(value) => handleChange('commitment_level', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="casual">Casual - Taking it slow</SelectItem>
              <SelectItem value="serious">Serious - Building something meaningful</SelectItem>
              <SelectItem value="committed">Committed - Long-term partnership</SelectItem>
              <SelectItem value="married">Married/Life Partners - Forever commitment</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="relationship-values">Top Relationship Values</Label>
          <Select 
            value={formData.relationship_values || ''} 
            onValueChange={(value) => handleChange('relationship_values', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trust">Trust</SelectItem>
              <SelectItem value="communication">Communication</SelectItem>
              <SelectItem value="respect">Respect</SelectItem>
              <SelectItem value="intimacy">Intimacy</SelectItem>
              <SelectItem value="growth">Growth</SelectItem>
              <SelectItem value="fun">Fun & Adventure</SelectItem>
              <SelectItem value="stability">Stability</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
};

export default Step3Relationship;
