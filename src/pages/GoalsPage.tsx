
import React, { useEffect, useState } from 'react';
import { Goal } from '@/types/goals';
import { fetchMyGoals, fetchSharedGoals } from '@/services/goalService';
import { useToast } from '@/components/ui/use-toast';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Dialog } from "@/components/ui/dialog";
import { Drawer } from "@/components/ui/drawer";
import { GoalModal } from '@/components/goals/GoalModal';
import { supabase } from '@/integrations/supabase/client';
import { GoalPageHeader } from '@/components/goals/GoalPageHeader';
import { GoalProgressCard } from '@/components/goals/GoalProgressCard';
import { SharedGoalsList } from '@/components/goals/SharedGoalsList';
import { toast } from 'sonner';
import { Loader2, Share2, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoalsList } from '@/components/goals/GoalsList';

const GoalsPage = () => {
  const [myGoals, setMyGoals] = useState<Goal[]>([]);
  const [sharedGoals, setSharedGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | undefined>(undefined);
  const { toast: uiToast } = useToast();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  
  const fetchGoals = async () => {
    setIsLoading(true);
    try {
      const [myGoalsData, sharedGoalsData] = await Promise.all([
        fetchMyGoals(),
        fetchSharedGoals()
      ]);
      
      // Set personal goals (not shared)
      setMyGoals(myGoalsData.filter(goal => !goal.is_shared));
      
      // Set all shared goals
      setSharedGoals(sharedGoalsData);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast.error('There was an error loading your goals. Please try again.');
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
      
      toast.success('The goal has been deleted successfully.');
      
      // Update local state to remove the deleted goal
      setMyGoals(myGoals.filter(g => g.id !== goalId));
      setSharedGoals(sharedGoals.filter(g => g.id !== goalId));
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('There was an error deleting the goal.');
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
  
  // Calculate overall progress based on all goals
  const allGoals = [...myGoals, ...sharedGoals];
  
  const totalGoals = allGoals.length;
  const totalCompleted = allGoals.filter(goal => goal.status === 'completed').length;
  const overallProgress = totalGoals > 0 
    ? Math.round((totalCompleted / totalGoals) * 100) 
    : 0;

  // If the app is still initializing and loading data, show a loading state
  if (isLoading && myGoals.length === 0 && sharedGoals.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <GoalPageHeader 
        isLoading={isLoading}
        goalModalOpen={goalModalOpen}
        setGoalModalOpen={setGoalModalOpen}
        handleOpenNewGoal={handleOpenNewGoal}
        fetchGoals={fetchGoals}
        handleCloseModal={handleCloseModal}
        onSuccess={fetchGoals}
      />
      
      <GoalProgressCard 
        totalGoals={totalGoals} 
        totalCompleted={totalCompleted} 
        overallProgress={overallProgress} 
      />
      
      <Tabs defaultValue="shared">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="shared">
            <Share2 className="h-4 w-4 mr-2" />
            Shared Goals
          </TabsTrigger>
          <TabsTrigger value="personal">
            <Target className="h-4 w-4 mr-2" />
            Personal Goals
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="shared" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Shared Relationship Goals</CardTitle>
              <CardDescription>
                Goals that you and your partner are working on together
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SharedGoalsList 
                goals={sharedGoals} 
                onEdit={handleEditGoal} 
                onDelete={handleDeleteGoal}
                onRefresh={fetchGoals}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="personal" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">My Personal Goals</CardTitle>
              <CardDescription>
                Goals that only you can see and manage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GoalsList 
                goals={myGoals} 
                onEdit={handleEditGoal} 
                onDelete={handleDeleteGoal}
                onRefresh={fetchGoals}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Render the edit goal modal when a goal is selected for editing */}
      {isDesktop ? (
        <Dialog open={goalModalOpen} onOpenChange={setGoalModalOpen}>
          {goalModalOpen && (
            <GoalModal
              goal={selectedGoal}
              onClose={handleCloseModal}
              onSuccess={fetchGoals}
            />
          )}
        </Dialog>
      ) : (
        <Drawer open={goalModalOpen} onOpenChange={setGoalModalOpen}>
          {goalModalOpen && (
            <GoalModal
              goal={selectedGoal}
              onClose={handleCloseModal}
              onSuccess={fetchGoals}
            />
          )}
        </Drawer>
      )}
    </div>
  );
}

export default GoalsPage;
