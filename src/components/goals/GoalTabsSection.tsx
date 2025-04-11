
import React, { useEffect, useState } from 'react';
import { Goal } from '@/types/goals';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoalsList } from '@/components/goals/GoalsList';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface GoalTabsSectionProps {
  myGoals: Goal[];
  sharedGoals: Goal[];
  isLoading: boolean;
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
  onRefresh: () => void;
}

export function GoalTabsSection({
  myGoals,
  sharedGoals,
  isLoading,
  onEdit,
  onDelete,
  onRefresh
}: GoalTabsSectionProps) {
  const { profile } = useAuth();
  const [filteredGoals, setFilteredGoals] = useState<Goal[]>([]);
  const [onlySharedGoals, setOnlySharedGoals] = useState<Goal[]>([]);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  
  useEffect(() => {
    // Set partner ID from profile
    if (profile && profile.partner_id) {
      setPartnerId(profile.partner_id);
    }
    
    // Filter shared goals: either owned by user or shared by partner
    const sharedGoalsToShow = sharedGoals.filter(goal => goal.is_shared);
    setOnlySharedGoals(sharedGoalsToShow);
    
    // Filter personal goals: owned by user and not shared
    const personalGoals = myGoals.filter(goal => !goal.is_shared);
    setFilteredGoals(personalGoals);
  }, [myGoals, sharedGoals, profile]);
  
  // Set up subscription for real-time updates on goals
  useEffect(() => {
    const channel = supabase
      .channel('goal-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'goals'
      }, () => {
        // Refresh goals when any change occurs
        onRefresh();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [onRefresh]);
  
  return (
    <Tabs defaultValue="my-goals">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="my-goals">My Goals ({filteredGoals.length})</TabsTrigger>
        <TabsTrigger value="shared-goals">Shared Goals ({onlySharedGoals.length})</TabsTrigger>
        <TabsTrigger value="partner-goals">Partner's Goals ({sharedGoals.length - onlySharedGoals.length})</TabsTrigger>
      </TabsList>
      
      <TabsContent value="my-goals" className="mt-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">Loading goals...</p>
          </div>
        ) : (
          <GoalsList 
            goals={filteredGoals} 
            onEdit={onEdit} 
            onDelete={onDelete}
            onRefresh={onRefresh}
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
            goals={onlySharedGoals}
            onEdit={onEdit} 
            onDelete={onDelete}
            onRefresh={onRefresh}
            isSharedView={true}
            partnerId={partnerId}
          />
        )}
      </TabsContent>
      
      <TabsContent value="partner-goals" className="mt-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">Loading partner goals...</p>
          </div>
        ) : (
          <GoalsList 
            goals={sharedGoals.filter(goal => !goal.is_shared)}
            onEdit={onEdit} 
            onDelete={onDelete}
            onRefresh={onRefresh}
            isPartnerView={true}
          />
        )}
      </TabsContent>
    </Tabs>
  );
}
