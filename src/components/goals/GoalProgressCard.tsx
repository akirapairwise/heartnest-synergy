
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface GoalProgressCardProps {
  totalGoals: number;
  totalCompleted: number;
  overallProgress: number;
}

export function GoalProgressCard({ 
  totalGoals, 
  totalCompleted, 
  overallProgress 
}: GoalProgressCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Goal Progress</CardTitle>
        <CardDescription>
          {totalCompleted} of {totalGoals} goals completed
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
