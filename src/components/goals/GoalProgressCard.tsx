
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Target, Clock } from "lucide-react";

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
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-1 gap-8 justify-around md:justify-start">
            <div className="text-center md:text-left">
              <p className="text-2xl font-bold">{totalGoals}</p>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Target className="h-4 w-4" />
                <span>Total Goals</span>
              </div>
            </div>
            
            <div className="text-center md:text-left">
              <p className="text-2xl font-bold text-green-600">{totalCompleted}</p>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Completed</span>
              </div>
            </div>
            
            <div className="text-center md:text-left">
              <p className="text-2xl font-bold text-amber-600">{totalGoals - totalCompleted}</p>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 text-amber-600" />
                <span>In Progress</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm font-medium">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
