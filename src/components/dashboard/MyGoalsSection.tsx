
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Goal } from '@/types/goals';
import { fetchMyGoals, updateGoalProgress } from '@/services/goalService';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import GoalStats from './goals/GoalStats';
import GoalList from './goals/GoalList';

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
        <GoalStats 
          totalGoals={goals.length}
          completedGoals={completedGoals}
          inProgressGoals={inProgressGoals}
        />
        
        <GoalList 
          goals={goals}
          isLoading={isLoading}
          onToggleComplete={handleToggleComplete}
          onUpdateProgress={handleUpdateProgress}
        />
      </CardContent>
    </Card>
  );
};

export default MyGoalsSection;
