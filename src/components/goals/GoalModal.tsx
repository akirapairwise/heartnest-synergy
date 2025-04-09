
import React, { useState } from 'react';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Goal, GoalCategory, GoalStatus } from "@/types/goals";
import { createGoal, updateGoalStatus } from "@/services/goalService";
import { useToast } from "@/components/ui/use-toast";

interface GoalFormValues {
  title: string;
  description: string;
  category: GoalCategory | '';
  is_shared: boolean;
  status: GoalStatus;
}

interface GoalModalProps {
  goal?: Goal;
  onClose: () => void;
  onSuccess: () => void;
}

export function GoalModal({ goal, onClose, onSuccess }: GoalModalProps) {
  const [formValues, setFormValues] = useState<GoalFormValues>({
    title: goal?.title || '',
    description: goal?.description || '',
    category: (goal?.category as GoalCategory) || '',
    is_shared: goal?.is_shared || false,
    status: (goal?.status as GoalStatus) || 'pending'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formValues.title.trim()) {
      toast({
        title: "Title is required",
        description: "Please enter a title for your goal",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      if (goal) {
        // Update existing goal
        await updateGoalStatus(goal.id, formValues.status);
        toast({
          title: "Goal updated",
          description: "Your goal has been updated successfully"
        });
      } else {
        // Create new goal
        const { goal: newGoal, error } = await createGoal({
          title: formValues.title,
          description: formValues.description,
          category: formValues.category || null,
          is_shared: formValues.is_shared,
          status: formValues.status
        });
        
        if (error) {
          throw new Error(error);
        }
        
        toast({
          title: "Goal created",
          description: "Your new goal has been created successfully"
        });
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving goal:", error);
      toast({
        title: "Error",
        description: "There was an error saving your goal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
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
  
  const Content = isDesktop ? DialogContent : DrawerContent;
  const Header = isDesktop ? DialogHeader : DrawerHeader;
  const Title = isDesktop ? DialogTitle : DrawerTitle;
  const Description = isDesktop ? DialogDescription : DrawerDescription;
  const Footer = isDesktop ? DialogFooter : DrawerFooter;

  return (
    <Content>
      <Header>
        <Title>{goal ? 'Edit Goal' : 'Create New Goal'}</Title>
        <Description>
          {goal 
            ? 'Update your relationship goal details' 
            : 'Add a new goal to strengthen your relationship'}
        </Description>
      </Header>
      
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Goal Title</Label>
            <Input 
              id="title" 
              value={formValues.title}
              onChange={e => setFormValues({...formValues, title: e.target.value})}
              placeholder="What do you want to achieve?"
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
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formValues.category} 
                onValueChange={(value) => setFormValues({...formValues, category: value as GoalCategory})}
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
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="is_shared" 
              checked={formValues.is_shared}
              onCheckedChange={value => setFormValues({...formValues, is_shared: value})}
            />
            <Label htmlFor="is_shared">Share this goal with my partner</Label>
          </div>
        </div>
        
        <Footer>
          <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : goal ? 'Update Goal' : 'Create Goal'}
          </Button>
        </Footer>
      </form>
    </Content>
  );
}
