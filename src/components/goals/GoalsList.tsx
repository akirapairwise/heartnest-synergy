
import React from 'react';
import { Goal } from '@/types/goals';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { updateGoalStatus } from '@/services/goalService';
import { GoalsTable } from './GoalsTable';
import { GoalsCardList } from './GoalsCardList';
import { GoalsEmptyState } from './GoalsEmptyState';
import { DeleteGoalDialog } from './DeleteGoalDialog';

interface GoalsListProps {
  goals: Goal[];
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
  onRefresh: () => void;
  isSharedView?: boolean;
  isPartnerView?: boolean;
  partnerId?: string | null;
}

export function GoalsList({ 
  goals, 
  onEdit, 
  onDelete, 
  onRefresh, 
  isSharedView = false,
  isPartnerView = false,
  partnerId
}: GoalsListProps) {
  const { toast } = useToast();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [goalToDelete, setGoalToDelete] = React.useState<string | null>(null);
  const { user, profile } = useAuth();

  const handleStatusToggle = async (goal: Goal) => {
    try {
      const newStatus = goal.status === 'completed' ? 'in_progress' : 'completed';
      await updateGoalStatus(goal.id, newStatus);
      toast({
        title: `Goal ${newStatus === 'completed' ? 'completed' : 'reopened'}`,
        description: `The goal has been marked as ${newStatus === 'completed' ? 'completed' : 'in progress'}.`
      });
      onRefresh();
    } catch (error) {
      console.error('Error updating goal status:', error);
      toast({
        title: 'Error',
        description: 'There was an error updating the goal status.',
        variant: 'destructive'
      });
    }
  };

  const confirmDelete = (goalId: string) => {
    setGoalToDelete(goalId);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = () => {
    if (goalToDelete) {
      onDelete(goalToDelete);
      setDeleteConfirmOpen(false);
      setGoalToDelete(null);
    }
  };
  
  const isOwner = (goal: Goal) => {
    return goal.owner_id === user?.id;
  };
  
  const getOwnerLabel = (goal: Goal) => {
    if (isOwner(goal)) {
      return "You";
    } else if (goal.owner_id === profile?.partner_id) {
      return "Partner"; // Using a generic "Partner" label instead of partner_name
    } else {
      return "Unknown";
    }
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || 'PA';
  };
  
  if (goals.length === 0) {
    return <GoalsEmptyState isSharedView={isSharedView} isPartnerView={isPartnerView} />;
  }

  return (
    <>
      {isDesktop ? (
        <GoalsTable
          goals={goals}
          isSharedView={isSharedView}
          isPartnerView={isPartnerView}
          isOwner={isOwner}
          getOwnerLabel={getOwnerLabel}
          getInitials={getInitials}
          handleStatusToggle={handleStatusToggle}
          onEdit={onEdit}
          confirmDelete={confirmDelete}
        />
      ) : (
        <GoalsCardList
          goals={goals}
          isSharedView={isSharedView}
          isPartnerView={isPartnerView}
          isOwner={isOwner}
          getOwnerLabel={getOwnerLabel}
          getInitials={getInitials}
          handleStatusToggle={handleStatusToggle}
          onEdit={onEdit}
          confirmDelete={confirmDelete}
        />
      )}

      <DeleteGoalDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDelete}
      />
    </>
  );
}
