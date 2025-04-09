
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Plus, RefreshCw } from "lucide-react";
import { Goal } from '@/types/goals';
import { fetchMyGoals, fetchPartnerGoals, updateGoalStatus } from '@/services/goalService';
import { useToast } from '@/components/ui/use-toast';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerTrigger } from "@/components/ui/drawer";
import { GoalModal } from '@/components/goals/GoalModal';
import { GoalsList } from '@/components/goals/GoalsList';
import { supabase } from '@/integrations/supabase/client';

const GoalsPage = () => {
  const [myGoals, setMyGoals] = useState<Goal[]>([]);
  const [sharedGoals, setSharedGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | undefined>(undefined);
  const { toast } = useToast();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  
  const fetchGoals = async () => {
    setIsLoading(true);
    try {
      const [myGoalsData, sharedGoalsData] = await Promise.all([
        fetchMyGoals(),
        fetchPartnerGoals()
      ]);
      
      setMyGoals(myGoalsData);
      setSharedGoals(sharedGoalsData);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast({
        title: 'Error',
        description: 'There was an error loading your goals. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchGoals();
    
    // Set up real-time subscription for goal updates
    const channel = supabase
      .channel('goals-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'goals'
      }, () => {
        fetchGoals();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  const handleEditGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setGoalModalOpen(true);
  };
  
  const handleDeleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);
        
      if (error) throw error;
      
      toast({
        title: 'Goal deleted',
        description: 'The goal has been deleted successfully.'
      });
      
      // Update local state to remove the deleted goal
      setMyGoals(myGoals.filter(g => g.id !== goalId));
      setSharedGoals(sharedGoals.filter(g => g.id !== goalId));
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: 'Error',
        description: 'There was an error deleting the goal.',
        variant: 'destructive'
      });
    }
  };
  
  const handleOpenNewGoal = () => {
    setSelectedGoal(undefined);
    setGoalModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setGoalModalOpen(false);
    setSelectedGoal(undefined);
  };
  
  // Calculate overall progress
  const myGoalsCompleted = myGoals.filter(goal => goal.status === 'completed').length;
  const myGoalsProgress = myGoals.length > 0 
    ? Math.round((myGoalsCompleted / myGoals.length) * 100) 
    : 0;
    
  const sharedGoalsCompleted = sharedGoals.filter(goal => goal.status === 'completed').length;
  const sharedGoalsProgress = sharedGoals.length > 0 
    ? Math.round((sharedGoalsCompleted / sharedGoals.length) * 100) 
    : 0;
  
  const totalGoals = myGoals.length + sharedGoals.length;
  const totalCompleted = myGoalsCompleted + sharedGoalsCompleted;
  const overallProgress = totalGoals > 0 
    ? Math.round((totalCompleted / totalGoals) * 100) 
    : 0;
    
  // Wrapper component to handle mobile vs desktop modal
  const GoalFormWrapper = ({ children }: { children: React.ReactNode }) => {
    if (isDesktop) {
      return (
        <Dialog open={goalModalOpen} onOpenChange={setGoalModalOpen}>
          <DialogTrigger asChild>{children}</DialogTrigger>
          {goalModalOpen && (
            <GoalModal
              goal={selectedGoal}
              onClose={handleCloseModal}
              onSuccess={fetchGoals}
            />
          )}
        </Dialog>
      );
    }
    
    return (
      <Drawer open={goalModalOpen} onOpenChange={setGoalModalOpen}>
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        {goalModalOpen && (
          <GoalModal
            goal={selectedGoal}
            onClose={handleCloseModal}
            onSuccess={fetchGoals}
          />
        )}
      </Drawer>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Relationship Goals</h1>
          <p className="text-muted-foreground">Track and achieve your relationship aspirations together</p>
        </div>
        
        <div className="flex items-center gap-2">
          <GoalFormWrapper>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Goal
            </Button>
          </GoalFormWrapper>
          
          <Button variant="outline" size="icon" onClick={fetchGoals} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      
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
      
      <Tabs defaultValue="my-goals">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-goals">My Goals ({myGoals.length})</TabsTrigger>
          <TabsTrigger value="shared-goals">Shared Goals ({sharedGoals.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="my-goals" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <p className="text-muted-foreground">Loading goals...</p>
            </div>
          ) : (
            <GoalsList 
              goals={myGoals} 
              onEdit={handleEditGoal} 
              onDelete={handleDeleteGoal}
              onRefresh={fetchGoals}
            />
          )}
        </TabsContent>
        
        <TabsContent value="shared-goals" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <p className="text-muted-foreground">Loading shared goals...</p>
            </div>
          ) : (
            <GoalsList 
              goals={sharedGoals} 
              onEdit={handleEditGoal} 
              onDelete={handleDeleteGoal}
              onRefresh={fetchGoals}
            />
          )}
        </TabsContent>
      </Tabs>
      
      {!isDesktop && goalModalOpen && (
        <GoalFormWrapper>
          <div></div>
        </GoalFormWrapper>
      )}
    </div>
  );
};

export default GoalsPage;
