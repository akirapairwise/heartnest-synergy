
import React from 'react';
import { Button } from "@/components/ui/button";
import { Goal } from '@/types/goals';
import GoalItem from './GoalItem';
import { useNavigate } from 'react-router-dom';

interface GoalListProps {
  goals: Goal[];
  isLoading: boolean;
  onToggleComplete: (goal: Goal) => void;
  onUpdateProgress: (goalId: string, newProgress: number) => void;
}

const GoalList = ({ goals, isLoading, onToggleComplete, onUpdateProgress }: GoalListProps) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-muted rounded w-full mb-4"></div>
            <div className="h-2 bg-muted rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <p>You don't have any goals yet.</p>
        <Button 
          variant="link" 
          className="mt-2" 
          onClick={() => navigate('/goals')}
        >
          Create your first goal
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {goals.slice(0, 4).map((goal) => (
        <GoalItem 
          key={goal.id} 
          goal={goal} 
          onToggleComplete={onToggleComplete}
          onUpdateProgress={onUpdateProgress}
        />
      ))}
      
      {goals.length > 4 && (
        <div className="mt-6 text-center">
          <Button variant="outline" onClick={() => navigate('/goals')}>
            View all goals
          </Button>
        </div>
      )}
    </div>
  );
};

export default GoalList;
