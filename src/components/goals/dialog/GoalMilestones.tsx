
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Milestone } from 'lucide-react';
import { Goal } from '@/types/goals';

interface GoalMilestonesProps {
  goal: Goal;
  progress: number;
  onMilestoneToggle: (milestone: string, checked: boolean) => void;
}

export function GoalMilestones({ goal, progress, onMilestoneToggle }: GoalMilestonesProps) {
  if (!goal.milestones || goal.milestones.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium">Progress</h4>
          <span className="text-sm font-medium">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-2">Milestones</h4>
        <ul className="space-y-2">
          {goal.milestones.map((milestone, index) => {
            const isCompleted = goal.completed_milestones?.includes(milestone) || false;
            
            return (
              <li key={`${milestone}-${index}`} className="flex items-start gap-2">
                <Checkbox 
                  id={`milestone-${index}`}
                  checked={isCompleted}
                  onCheckedChange={(checked) => {
                    onMilestoneToggle(milestone, checked === true);
                  }}
                  className="mt-0.5"
                />
                <label 
                  htmlFor={`milestone-${index}`}
                  className={`text-sm flex-1 cursor-pointer ${isCompleted ? 'line-through text-muted-foreground' : ''}`}
                >
                  {milestone}
                </label>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
