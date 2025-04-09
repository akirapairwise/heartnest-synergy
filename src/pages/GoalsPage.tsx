
import React, { useEffect, useState } from 'react';
import { Goal } from '@/types/goals';
import { fetchMyGoals, fetchPartnerGoals } from '@/services/goalService';
import { useToast } from '@/components/ui/use-toast';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerTrigger } from "@/components/ui/drawer";
import { GoalModal } from '@/components/goals/GoalModal';
import { supabase } from '@/integrations/supabase/client';
import { GoalPageHeader } from '@/components/goals/GoalPageHeader';
import { GoalProgressCard } from '@/components/goals/GoalProgressCard';
import { GoalTabsSection } from '@/components/goals/GoalTabsSection';

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
      
      <GoalTabsSection 
        myGoals={myGoals}
        sharedGoals={sharedGoals}
        isLoading={isLoading}
        onEdit={handleEditGoal}
        onDelete={handleDeleteGoal}
        onRefresh={fetchGoals}
      />
      
      {!isDesktop && goalModalOpen && (
        <Dialog open={goalModalOpen} onOpenChange={setGoalModalOpen}>
          <DialogTrigger asChild><div></div></DialogTrigger>
          <GoalModal
            goal={selectedGoal}
            onClose={handleCloseModal}
            onSuccess={fetchGoals}
          />
        </Dialog>
      )}
    </div>
  );
};

export default GoalsPage;
