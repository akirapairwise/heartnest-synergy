
import React from 'react';
import { Goal } from '@/types/goals';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { GoalStatusBadge } from './GoalStatusBadge';
import { GoalCategoryBadge } from './GoalCategoryBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { GoalMetadata } from './dialog/GoalMetadata';
import { GoalMilestones } from './dialog/GoalMilestones';
import { useMilestoneManagement } from '@/hooks/goals/useMilestoneManagement';

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
  const { handleMilestoneToggle, calculateProgress } = useMilestoneManagement(onRefresh);
  
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

  const progress = calculateProgress(goal);

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
            <span className={goal.status === 'completed' ? "line-through text-muted-foreground" : ""}>
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
          
          <GoalMilestones 
            goal={goal}
            progress={progress}
            onMilestoneToggle={(milestone, checked) => 
              handleMilestoneToggle(goal.id, milestone, checked)
            }
          />
          
          <GoalMetadata goal={goal} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
