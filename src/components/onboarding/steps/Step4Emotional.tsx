
import React from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Step4Props {
  formData: any;
  handleChange: (field: string, value: any) => void;
}

const Step4Emotional: React.FC<Step4Props> = ({ formData, handleChange }) => {
  return (
    <>
      <h3 className="text-lg font-medium mb-4">Emotional Needs & Financial Attitudes</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="emotional-needs">Your Emotional Needs</Label>
          <Textarea 
            id="emotional-needs" 
            placeholder="What emotional support do you need in a relationship?" 
            value={formData.emotional_needs || ''}
            onChange={(e) => handleChange('emotional_needs', e.target.value)}
            className="min-h-[100px]"
          />
          <p className="text-xs text-muted-foreground mt-1">How your partner can best support you emotionally</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="conflict-resolution">Conflict Resolution Style</Label>
          <Select 
            value={formData.conflict_resolution || ''} 
            onValueChange={(value) => handleChange('conflict_resolution', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="discuss">Discuss immediately</SelectItem>
              <SelectItem value="reflect">Need time to reflect first</SelectItem>
              <SelectItem value="avoid">Tend to avoid conflict</SelectItem>
              <SelectItem value="compromise">Quick to compromise</SelectItem>
              <SelectItem value="emotional">Emotional processor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="financial-attitude">Financial Attitude</Label>
          <Select 
            value={formData.financial_attitude || ''} 
            onValueChange={(value) => handleChange('financial_attitude', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="saver">Saver</SelectItem>
              <SelectItem value="spender">Spender</SelectItem>
              <SelectItem value="investor">Investor</SelectItem>
              <SelectItem value="balanced">Balanced approach</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">Your general approach to money in relationships</p>
        </div>
      </div>
    </>
  );
};

export default Step4Emotional;
