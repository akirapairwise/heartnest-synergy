
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Goal } from '@/types/goals';
import { format } from "date-fns";

interface GoalItemProps {
  goal: Goal;
  onToggleComplete: (goal: Goal) => void;
  onUpdateProgress: (goalId: string, newProgress: number) => void;
}

const GoalItem = ({ goal, onToggleComplete, onUpdateProgress }: GoalItemProps) => {
  const hasDeadline = goal.deadline ? true : false;
  
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
            
            {hasDeadline && (
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <CalendarClock className="h-3 w-3 mr-1" />
                <span>Due: {format(new Date(goal.deadline!), "PPP")}</span>
              </div>
            )}
            
            {goal.milestones && goal.milestones.length > 0 && (
              <div className="mt-2">
                <span className="text-xs font-medium">Milestones:</span>
                <ul className="list-disc list-inside text-xs text-muted-foreground">
                  {goal.milestones.slice(0, 2).map((milestone, idx) => (
                    <li key={idx} className="truncate">{milestone}</li>
                  ))}
                  {goal.milestones.length > 2 && (
                    <li className="text-xs text-primary-foreground/70">+{goal.milestones.length - 2} more</li>
                  )}
                </ul>
              </div>
            )}
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
