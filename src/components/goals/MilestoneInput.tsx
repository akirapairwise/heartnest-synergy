
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, X, Milestone } from 'lucide-react';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { GoalFormValues } from './GoalFormSchema';

interface MilestoneInputProps {
  form: UseFormReturn<GoalFormValues>;
}

export const MilestoneInput = ({ form }: MilestoneInputProps) => {
  const [newMilestone, setNewMilestone] = useState('');
  
  const addMilestone = () => {
    if (newMilestone.trim() === '') return;
    
    const currentMilestones = form.getValues('milestones') || [];
    form.setValue('milestones', [...currentMilestones, newMilestone]);
    setNewMilestone('');
  };

  const removeMilestone = (index: number) => {
    const currentMilestones = form.getValues('milestones') || [];
    const updatedMilestones = currentMilestones.filter((_, i) => i !== index);
    form.setValue('milestones', updatedMilestones);
  };
  
  return (
    <div className="space-y-3">
      <div className="flex space-x-2">
        <Input
          placeholder="Add milestone..."
          value={newMilestone}
          onChange={(e) => setNewMilestone(e.target.value)}
          className="flex-1 focus:ring-2 focus:ring-primary/30 transition-all"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addMilestone();
            }
          }}
        />
        <Button 
          type="button" 
          onClick={addMilestone}
          variant="outline"
          className="flex-shrink-0"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>
      
      <FormField
        control={form.control}
        name="milestones"
        render={() => (
          <FormItem>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.watch('milestones')?.map((milestone, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="pl-3 pr-2 py-1.5 flex items-center gap-1 text-sm"
                >
                  <Milestone className="h-3.5 w-3.5 mr-1" />
                  {milestone}
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5 p-0 ml-1 hover:bg-secondary/80 rounded-full"
                    onClick={() => removeMilestone(index)}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </Badge>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default MilestoneInput;
