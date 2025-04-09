
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, CheckCircle2, Circle, PlusCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Goal } from '@/types/goals';
import { fetchMyGoals, updateGoalProgress } from '@/services/goalService';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';

const MyGoalsSection = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadGoals = async () => {
      setIsLoading(true);
      try {
        const goalsData = await fetchMyGoals();
        setGoals(goalsData);
      } catch (error) {
        console.error('Error loading goals:', error);
        toast.error('Failed to load goals');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadGoals();
  }, []);
  
  const handleUpdateProgress = async (goalId: string, newProgress: number) => {
    try {
      const { success, error } = await updateGoalProgress(goalId, newProgress);
      
      if (success) {
        // Update the local state
        setGoals(goals.map(goal => 
          goal.id === goalId 
            ? { 
                ...goal, 
                progress: newProgress, 
                completed: newProgress === 100,
                status: newProgress === 100 ? 'completed' : newProgress > 0 ? 'in_progress' : 'pending'
              } 
            : goal
        ));
        
        toast.success(`Goal progress updated to ${newProgress}%`);
      } else {
        throw error || new Error('Failed to update goal progress');
      }
    } catch (error: any) {
      console.error('Error updating goal progress:', error);
      toast.error('Failed to update goal progress: ' + (error.message || 'Unknown error'));
    }
  };
  
  const handleToggleComplete = async (goal: Goal) => {
    const newProgress = goal.completed ? 0 : 100;
    await handleUpdateProgress(goal.id, newProgress);
  };
  
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
          <Button size="sm" onClick={() => navigate('/goals')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Goal
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full mb-4"></div>
                <div className="h-2 bg-muted rounded w-full"></div>
              </div>
            ))}
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
                <p>You don't have any goals yet.</p>
                <Button 
                  variant="link" 
                  className="mt-2" 
                  onClick={() => navigate('/goals')}
                >
                  Create your first goal
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {goals.slice(0, 4).map((goal) => (
                  <div key={goal.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-3">
                        <button 
                          onClick={() => handleToggleComplete(goal)}
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
                            onClick={() => handleUpdateProgress(goal.id, 0)}
                          >
                            0%
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-xs"
                            onClick={() => handleUpdateProgress(goal.id, 50)}
                          >
                            50%
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-xs"
                            onClick={() => handleUpdateProgress(goal.id, 100)}
                          >
                            100%
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {goals.length > 4 && (
              <div className="mt-6 text-center">
                <Button variant="outline" onClick={() => navigate('/goals')}>
                  View all goals
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MyGoalsSection;
