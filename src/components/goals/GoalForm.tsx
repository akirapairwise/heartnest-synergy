
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Goal, GoalCategory, GoalStatus } from "@/types/goals";
import { Loader2, CalendarIcon, Plus, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface GoalFormProps {
  goal?: Goal;
  onSubmit: (values: GoalFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export interface GoalFormValues {
  title: string;
  description: string;
  category: GoalCategory | '';
  is_shared: boolean;
  status: GoalStatus;
  milestones: string[];
  deadline: Date | null;
}

export function GoalForm({ goal, onSubmit, onCancel, isSubmitting }: GoalFormProps) {
  const [formValues, setFormValues] = useState<GoalFormValues>({
    title: goal?.title || '',
    description: goal?.description || '',
    category: (goal?.category as GoalCategory) || '',
    is_shared: goal?.is_shared || false,
    status: (goal?.status as GoalStatus) || 'pending',
    milestones: goal?.milestones || [],
    deadline: goal?.deadline ? new Date(goal.deadline) : null
  });

  const [newMilestone, setNewMilestone] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formValues);
  };
  
  const categoryOptions: { value: GoalCategory; label: string }[] = [
    { value: 'communication', label: 'Communication' },
    { value: 'quality-time', label: 'Quality Time' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'understanding', label: 'Understanding' },
    { value: 'growth', label: 'Personal Growth' },
    { value: 'intimacy', label: 'Intimacy' }
  ];
  
  const statusOptions: { value: GoalStatus; label: string }[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const addMilestone = () => {
    if (newMilestone.trim()) {
      setFormValues({
        ...formValues,
        milestones: [...formValues.milestones, newMilestone.trim()]
      });
      setNewMilestone('');
    }
  };

  const removeMilestone = (index: number) => {
    const updatedMilestones = [...formValues.milestones];
    updatedMilestones.splice(index, 1);
    setFormValues({
      ...formValues,
      milestones: updatedMilestones
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="title">Goal Title</Label>
          <Input 
            id="title" 
            value={formValues.title}
            onChange={e => setFormValues({...formValues, title: e.target.value})}
            placeholder="What do you want to achieve?"
            disabled={isSubmitting}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description" 
            value={formValues.description || ''}
            onChange={e => setFormValues({...formValues, description: e.target.value})}
            placeholder="Add more details about this goal"
            rows={3}
            disabled={isSubmitting}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={formValues.category} 
              onValueChange={(value) => setFormValues({...formValues, category: value as GoalCategory})}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {goal && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formValues.status} 
                onValueChange={(value) => setFormValues({...formValues, status: value as GoalStatus})}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Deadline Field */}
        <div className="space-y-2">
          <Label htmlFor="deadline">Deadline (Optional)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formValues.deadline && "text-muted-foreground"
                )}
                disabled={isSubmitting}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formValues.deadline ? format(formValues.deadline, "PPP") : "Set a deadline"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formValues.deadline || undefined}
                onSelect={(date) => setFormValues({...formValues, deadline: date})}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Milestones Field */}
        <div className="space-y-2">
          <Label htmlFor="milestones">Milestones (Optional)</Label>
          <div className="flex space-x-2">
            <Input
              id="new-milestone"
              value={newMilestone}
              onChange={e => setNewMilestone(e.target.value)}
              placeholder="Add a milestone for your goal"
              className="flex-1"
              disabled={isSubmitting}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addMilestone();
                }
              }}
            />
            <Button 
              type="button" 
              variant="outline" 
              size="icon" 
              onClick={addMilestone}
              disabled={isSubmitting || !newMilestone.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {formValues.milestones.length > 0 && (
            <div className="mt-2 space-y-2">
              {formValues.milestones.map((milestone, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between bg-secondary/50 rounded-md p-2 text-sm"
                >
                  <span>{milestone}</span>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={() => removeMilestone(index)}
                    disabled={isSubmitting}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="is_shared" 
            checked={formValues.is_shared}
            onCheckedChange={value => setFormValues({...formValues, is_shared: value})}
            disabled={isSubmitting}
          />
          <Label htmlFor="is_shared">Share this goal with my partner</Label>
        </div>
      </div>
      
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
        <Button variant="outline" type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {goal ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            goal ? 'Update Goal' : 'Create Goal'
          )}
        </Button>
      </div>
    </form>
  );
}
