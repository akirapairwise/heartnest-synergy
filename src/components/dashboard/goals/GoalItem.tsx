
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Goal } from '@/types/goals';

interface GoalItemProps {
  goal: Goal;
  onToggleComplete: (goal: Goal) => void;
  onUpdateProgress: (goalId: string, newProgress: number) => void;
}

const GoalItem = ({ goal, onToggleComplete, onUpdateProgress }: GoalItemProps) => {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-3">
          <button 
            onClick={() => onToggleComplete(goal)}
            className="flex-shrink-0 mt-0.5 focus:outline-none"
          >
            {goal.completed ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
          <div>
            <h3 className={`font-medium ${goal.completed ? 'line-through text-muted-foreground' : ''}`}>
              {goal.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
          </div>
        </div>
      </div>
      
      {!goal.completed && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Progress</span>
            <span className="text-xs font-medium">{goal.progress}%</span>
          </div>
          <Progress value={goal.progress} className="h-2" />
          <div className="flex justify-between mt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs"
              onClick={() => onUpdateProgress(goal.id, 0)}
            >
              0%
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs"
              onClick={() => onUpdateProgress(goal.id, 50)}
            >
              50%
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs"
              onClick={() => onUpdateProgress(goal.id, 100)}
            >
              100%
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalItem;
