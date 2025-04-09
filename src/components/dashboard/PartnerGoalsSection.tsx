
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, CheckCircle2, Circle, Calendar } from "lucide-react";
import { Goal } from '@/types/goals';
import { fetchPartnerGoals } from '@/services/goalService';

const PartnerGoalsSection = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadGoals = async () => {
      setIsLoading(true);
      const goalsData = await fetchPartnerGoals();
      setGoals(goalsData);
      setIsLoading(false);
    };
    
    loadGoals();
  }, []);
  
  const completedGoals = goals.filter(goal => goal.completed).length;
  const inProgressGoals = goals.filter(goal => !goal.completed).length;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-love-500" />
          Partner's Relationship Goals
        </CardTitle>
        <CardDescription>Goals your partner is working on</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse text-muted-foreground">Loading goals...</div>
          </div>
        ) : (
          <>
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
            
            {goals.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p>Your partner hasn't shared any goals with you yet.</p>
              </div>
            ) : (
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
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PartnerGoalsSection;
