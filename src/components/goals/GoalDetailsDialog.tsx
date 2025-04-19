
import React from 'react';
import { Goal } from '@/types/goals';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { GoalStatusBadge } from './GoalStatusBadge';
import { GoalCategoryBadge } from './GoalCategoryBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CalendarIcon, ListChecks } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Progress } from "@/components/ui/progress";

interface GoalDetailsDialogProps {
  goal: Goal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh: () => void;
}

export function GoalDetailsDialog({
  goal,
  open,
  onOpenChange,
  onRefresh
}: GoalDetailsDialogProps) {
  const { toast } = useToast();
  
  if (!goal) return null;

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name || name === 'Unknown') return 'UN';
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleMilestoneToggle = async (milestone: string, isChecked: boolean) => {
    try {
      const { data: currentGoal, error: fetchError } = await supabase
        .from('goals')
        .select('completed_milestones, milestones')
        .eq('id', goal.id)
        .single();

      if (fetchError) {
        console.error('Error fetching goal:', fetchError);
        toast({
          title: "Error",
          description: "Failed to load goal data",
          variant: "destructive"
        });
        return;
      }

      let completedMilestones = currentGoal?.completed_milestones || [];
      
      if (isChecked) {
        completedMilestones = [...completedMilestones, milestone];
      } else {
        completedMilestones = completedMilestones.filter(m => m !== milestone);
      }

      const totalMilestones = currentGoal?.milestones?.length || 0;
      const completionPercentage = totalMilestones > 0 
        ? Math.round((completedMilestones.length / totalMilestones) * 100)
        : 0;

      const status = completionPercentage === 100 ? 'completed' : 
                     completionPercentage > 0 ? 'in_progress' : 'pending';

      const { error: updateError } = await supabase
        .from('goals')
        .update({ 
          completed_milestones: completedMilestones,
          status
        })
        .eq('id', goal.id);

      if (updateError) {
        console.error('Error updating goal:', updateError);
        toast({
          title: "Error",
          description: "Failed to update milestone",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Milestone updated",
        description: isChecked ? "Milestone completed!" : "Milestone unchecked"
      });

      onRefresh();
    } catch (error) {
      console.error('Error updating milestone:', error);
      toast({
        title: "Error",
        description: "Failed to update milestone",
        variant: "destructive"
      });
    }
  };

  const calculateProgress = () => {
    if (!goal.milestones?.length) return 0;
    const completed = goal.completed_milestones?.length || 0;
    return Math.round((completed / goal.milestones.length) * 100);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {goal.is_shared && (
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {getInitials(goal.owner_name || '')}
                </AvatarFallback>
              </Avatar>
            )}
            <span className={goal.completed ? "line-through text-muted-foreground" : ""}>
              {goal.title}
            </span>
          </DialogTitle>
          <DialogDescription className="flex flex-wrap gap-2 items-center pt-2">
            <GoalStatusBadge status={goal.status as any} />
            <GoalCategoryBadge category={goal.category as any} />
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {goal.description && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Description</h4>
              <p className="text-sm text-muted-foreground">{goal.description}</p>
            </div>
          )}
          
          {goal.milestones && goal.milestones.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-1">
                <ListChecks className="h-4 w-4" />
                Milestones Progress
              </h4>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Overall Progress</span>
                  <span>{calculateProgress()}%</span>
                </div>
                <Progress value={calculateProgress()} className="h-2" />
              </div>
              <ul className="text-sm space-y-2">
                {goal.milestones.map((milestone, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Checkbox 
                      id={`milestone-${index}`}
                      checked={goal.completed_milestones?.includes(milestone)}
                      onCheckedChange={(checked) => 
                        handleMilestoneToggle(milestone, checked as boolean)
                      }
                    />
                    <label 
                      htmlFor={`milestone-${index}`}
                      className={`flex-1 ${
                        goal.completed_milestones?.includes(milestone) 
                          ? "line-through text-muted-foreground" 
                          : ""
                      }`}
                    >
                      {milestone}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {goal.deadline && (
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span>
                Deadline: {new Date(goal.deadline).toLocaleDateString()}
              </span>
            </div>
          )}
          
          {goal.is_shared && (
            <div className="pt-2">
              <Badge variant="outline" className="flex items-center gap-1">
                {goal.is_self_owned ? "Created by you" : `Shared by ${goal.owner_name || 'Partner'}`}
              </Badge>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">
            Created: {new Date(goal.created_at).toLocaleDateString()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
