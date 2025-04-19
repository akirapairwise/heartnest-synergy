
import React from 'react';
import { Goal } from '@/types/goals';
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { ListChecks } from 'lucide-react';
import { useMilestoneManagement } from '@/hooks/goals/useMilestoneManagement';

interface GoalMilestonesProps {
  goal: Goal;
  progress: number;
  onMilestoneToggle: (milestone: string, checked: boolean) => void;
}

export function GoalMilestones({ goal, progress, onMilestoneToggle }: GoalMilestonesProps) {
  if (!goal.milestones || goal.milestones.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium flex items-center gap-1">
        <ListChecks className="h-4 w-4" />
        Milestones Progress
      </h4>
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Overall Progress</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      <ul className="text-sm space-y-2">
        {goal.milestones.map((milestone, index) => (
          <li key={index} className="flex items-center gap-2">
            <Checkbox 
              id={`milestone-${index}`}
              checked={goal.completed_milestones?.includes(milestone)}
              onCheckedChange={(checked) => 
                onMilestoneToggle(milestone, checked as boolean)
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
  );
}
