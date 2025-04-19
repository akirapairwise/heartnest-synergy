import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, CheckCircle2, Circle, PlusCircle } from "lucide-react";
import { Goal } from '@/types/goals';
import { fetchMyGoals } from '@/services/goalService';
import { Link } from 'react-router-dom';

const GoalsCard = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadGoals = async () => {
      setIsLoading(true);
      const goalsData = await fetchMyGoals();
      setGoals(goalsData.slice(0, 3)); // Only show top 3 goals in the card
      setIsLoading(false);
    };
    
    loadGoals();
  }, []);
  
  const completedGoals = goals.filter(goal => goal.completed).length;
  const overallProgress = goals.length > 0
    ? Math.round((completedGoals / goals.length) * 100)
    : 0;
  
  return (
    <Card className="elevated-card soft-gradient-background">
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
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-pulse text-muted-foreground text-sm">Loading...</div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Overall progress</p>
                <p className="text-sm font-medium">{overallProgress}%</p>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
            
            {goals.length === 0 ? (
              <div className="text-center py-2 text-muted-foreground text-sm">
                <p>No goals created yet</p>
              </div>
            ) : (
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
            )}
            
            <div className="flex items-center justify-center">
              <Link 
                to="/goals"
                className="inline-flex items-center text-sm text-harmony-600 hover:text-harmony-700"
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Add new goal
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoalsCard;
