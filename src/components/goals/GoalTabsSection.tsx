
import React from 'react';
import { Goal } from '@/types/goals';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoalsList } from '@/components/goals/GoalsList';

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
  return (
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
            goals={sharedGoals} 
            onEdit={onEdit} 
            onDelete={onDelete}
            onRefresh={onRefresh}
          />
        )}
      </TabsContent>
    </Tabs>
  );
}
