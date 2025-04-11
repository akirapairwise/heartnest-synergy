
import React from 'react';
import { Goal } from '@/types/goals';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GoalStatusBadge } from './GoalStatusBadge';
import { GoalCategoryBadge } from './GoalCategoryBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CalendarIcon, ListChecks, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { updateGoalStatus } from '@/services/goalService';
import { useToast } from '@/components/ui/use-toast';

interface GoalDetailsDialogProps {
  goal: Goal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
  onRefresh: () => void;
}

export function GoalDetailsDialog({
  goal,
  open,
  onOpenChange,
  onEdit,
  onDelete,
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

  const handleStatusToggle = async () => {
    try {
      const newStatus = goal.status === 'completed' ? 'in_progress' : 'completed';
      await updateGoalStatus(goal.id, newStatus);
      toast({
        title: `Goal ${newStatus === 'completed' ? 'completed' : 'reopened'}`,
        description: `The goal has been marked as ${newStatus === 'completed' ? 'completed' : 'in progress'}.`
      });
      onRefresh();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating goal status:', error);
      toast({
        title: 'Error',
        description: 'There was an error updating the goal status.',
        variant: 'destructive'
      });
    }
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
                Milestones
              </h4>
              <ul className="text-sm space-y-1">
                {goal.milestones.map((milestone, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    {milestone}
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
        
        <DialogFooter className="flex justify-between sm:justify-between">
          <div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleStatusToggle}
            >
              {goal.status === 'completed' ? 'Reopen' : 'Complete'}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                onEdit(goal);
                onOpenChange(false);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            {goal.is_self_owned && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  onDelete(goal.id);
                  onOpenChange(false);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
