
import React from 'react';
import { Goal } from '@/types/goals';
import { useGoalManagement } from '@/hooks/goals/useGoalManagement';
import { SharedGoalItem } from './SharedGoalItem';
import { EmptySharedGoals } from './EmptySharedGoals';
import { DeleteGoalDialog } from './DeleteGoalDialog';
import { GoalDetailsDialog } from './GoalDetailsDialog';
import { TooltipProvider } from '@/components/ui/tooltip';

interface SharedGoalsListProps {
  goals: Goal[];
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
  onRefresh: () => void;
}

export function SharedGoalsList({ 
  goals,
  onEdit,
  onDelete,
  onRefresh
}: SharedGoalsListProps) {
  const {
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    selectedGoal,
    detailsOpen,
    setDetailsOpen,
    handleStatusToggle,
    confirmDelete,
    handleDelete,
    openDetails
  } = useGoalManagement(onRefresh);

  const getInitials = (name: string) => {
    if (!name || name === 'Unknown') return 'UN';
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const isOwner = (goal: Goal) => goal.is_self_owned;
  
  if (goals.length === 0) {
    return <EmptySharedGoals />;
  }

  return (
    <TooltipProvider>
      <>
        <div className="space-y-4">
          {goals.map((goal) => (
            <SharedGoalItem
              key={goal.id}
              goal={goal}
              getInitials={getInitials}
              handleStatusToggle={handleStatusToggle}
              openDetails={openDetails}
              onEdit={onEdit}
              confirmDelete={confirmDelete}
              isOwner={isOwner}
            />
          ))}
        </div>

        <DeleteGoalDialog
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          onConfirm={handleDelete}
        />

        <GoalDetailsDialog
          goal={selectedGoal}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          onRefresh={onRefresh}
        />
      </>
    </TooltipProvider>
  );
}
