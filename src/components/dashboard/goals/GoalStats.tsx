
import React from 'react';

interface GoalStatsProps {
  totalGoals: number;
  completedGoals: number;
  inProgressGoals: number;
}

const GoalStats = ({ totalGoals, completedGoals, inProgressGoals }: GoalStatsProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-harmony-600">{totalGoals}</p>
          <p className="text-sm text-muted-foreground">Total Goals</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{completedGoals}</p>
          <p className="text-sm text-muted-foreground">Completed</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-amber-600">{inProgressGoals}</p>
          <p className="text-sm text-muted-foreground">In Progress</p>
        </div>
      </div>
    </div>
  );
};

export default GoalStats;
