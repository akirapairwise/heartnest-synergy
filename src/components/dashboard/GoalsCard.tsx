
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, CheckCircle2, Circle, PlusCircle } from "lucide-react";

type Goal = {
  id: number;
  title: string;
  progress: number;
  completed: boolean;
  dueDate?: string;
};

const GoalsCard = () => {
  // Mock goals data (in a real app, this would come from a database)
  const goals: Goal[] = [
    { 
      id: 1, 
      title: "Have a weekly date night", 
      progress: 75, 
      completed: false,
      dueDate: "2025-04-30" 
    },
    { 
      id: 2, 
      title: "Create a shared bucket list", 
      progress: 100, 
      completed: true 
    },
    { 
      id: 3, 
      title: "Practice active listening", 
      progress: 40, 
      completed: false,
      dueDate: "2025-05-15" 
    },
  ];
  
  const completedGoals = goals.filter(goal => goal.completed).length;
  const overallProgress = Math.round((completedGoals / goals.length) * 100);
  
  return (
    <Card className="heart-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-harmony-500" />
            <CardTitle className="text-md">Relationship Goals</CardTitle>
          </div>
        </div>
        <CardDescription>Track your shared goals and growth</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Overall progress</p>
              <p className="text-sm font-medium">{overallProgress}%</p>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
          
          <div className="space-y-3">
            {goals.map((goal) => (
              <div key={goal.id} className="flex items-start gap-3 border-b pb-3">
                {goal.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <p className={`text-sm font-medium ${goal.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {goal.title}
                    </p>
                    {goal.dueDate && !goal.completed && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {new Date(goal.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                  {!goal.completed && (
                    <div className="mt-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-1.5" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-center">
            <a 
              href="/goals"
              className="inline-flex items-center text-sm text-harmony-600 hover:text-harmony-700"
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              Add new goal
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalsCard;
