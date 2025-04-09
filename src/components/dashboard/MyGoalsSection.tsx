
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, CheckCircle2, Circle, PlusCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

type Goal = {
  id: number;
  title: string;
  progress: number;
  completed: boolean;
  dueDate?: string;
  description?: string;
};

const MyGoalsSection = () => {
  // Mock goals data (in a real app, this would come from an API/database)
  const goals: Goal[] = [
    { 
      id: 1, 
      title: "Have a weekly date night", 
      progress: 75, 
      completed: false,
      dueDate: "2025-04-30",
      description: "Schedule and maintain a consistent weekly date night to reconnect" 
    },
    { 
      id: 2, 
      title: "Create a shared bucket list", 
      progress: 100, 
      completed: true,
      description: "Build a list of experiences we want to share together" 
    },
    { 
      id: 3, 
      title: "Practice active listening", 
      progress: 40, 
      completed: false,
      dueDate: "2025-05-15",
      description: "Improve communication by focusing on truly hearing my partner" 
    },
    { 
      id: 4, 
      title: "Plan a weekend getaway", 
      progress: 20, 
      completed: false,
      dueDate: "2025-06-10",
      description: "Organize a relaxing weekend trip for us to destress" 
    },
  ];
  
  const completedGoals = goals.filter(goal => goal.completed).length;
  const inProgressGoals = goals.filter(goal => !goal.completed).length;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-harmony-500" />
              My Relationship Goals
            </CardTitle>
            <CardDescription>Track your personal goals for the relationship</CardDescription>
          </div>
          <Button size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Goal
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-harmony-600">{goals.length}</p>
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
        
        <div className="space-y-6">
          {goals.map((goal) => (
            <div key={goal.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3">
                  {goal.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h3 className={`font-medium ${goal.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {goal.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                  </div>
                </div>
                {goal.dueDate && !goal.completed && (
                  <div className="flex items-center text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(goal.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                )}
              </div>
              
              {!goal.completed && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Progress</span>
                    <span className="text-xs font-medium">{goal.progress}%</span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MyGoalsSection;
