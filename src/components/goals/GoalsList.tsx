
import React from 'react';
import { Goal } from '@/types/goals';
import { useMediaQuery } from '@/hooks/use-media-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { updateGoalStatus } from '@/services/goalService';
import { GoalsTable } from './GoalsTable';
import { GoalsCardList } from './GoalsCardList';
import { GoalsEmptyState } from './GoalsEmptyState';
import { DeleteGoalDialog } from './DeleteGoalDialog';
import { GoalDetailsDialog } from './GoalDetailsDialog';

interface GoalsListProps {
  goals: Goal[];
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
  onRefresh: () => void;
  isSharedView?: boolean;
  isPartnerView?: boolean;
  partnerId?: string | null;
  isLoading?: boolean;
}

export function GoalsList({ 
  goals, 
  onEdit, 
  onDelete, 
  onRefresh, 
  isSharedView = false,
  isPartnerView = false,
  partnerId,
  isLoading = false
}: GoalsListProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [goalToDelete, setGoalToDelete] = React.useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = React.useState<Goal | null>(null);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const { user, profile } = useAuth();

  const handleStatusToggle = async (goal: Goal) => {
    try {
      const newStatus = goal.status === 'completed' ? 'in_progress' : 'completed';
      await updateGoalStatus(goal.id, newStatus);
      toast.success(`Goal ${newStatus === 'completed' ? 'completed' : 'reopened'}`);
      onRefresh();
    } catch (error) {
      console.error('Error updating goal status:', error);
      toast.error('There was an error updating the goal status.');
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
      return "Partner";
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
  
  const openDetails = (goal: Goal) => {
    setSelectedGoal(goal);
    setDetailsOpen(true);
  };
  
  // Show loading state or empty state if applicable
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-muted rounded w-full mb-4"></div>
            <div className="h-2 bg-muted rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }
  
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
          openDetails={openDetails}
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
          openDetails={openDetails}
        />
      )}

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
  );
}
