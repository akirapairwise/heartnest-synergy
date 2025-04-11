
import React from 'react';
import { Goal } from '@/types/goals';
import { GoalCard } from './GoalCard';

interface GoalsCardListProps {
  goals: Goal[];
  isSharedView: boolean;
  isPartnerView: boolean;
  isOwner: (goal: Goal) => boolean;
  getOwnerLabel: (goal: Goal) => string;
  getInitials: (name: string) => string;
  handleStatusToggle: (goal: Goal) => Promise<void>;
  onEdit: (goal: Goal) => void;
  confirmDelete: (goalId: string) => void;
}

export function GoalsCardList({
  goals,
  isSharedView,
  isPartnerView,
  isOwner,
  getOwnerLabel,
  getInitials,
  handleStatusToggle,
  onEdit,
  confirmDelete
}: GoalsCardListProps) {
  return (
    <div className="space-y-4">
      {goals.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          isSharedView={isSharedView}
          isPartnerView={isPartnerView}
          isOwner={isOwner}
          getOwnerLabel={getOwnerLabel}
          getInitials={getInitials}
          handleStatusToggle={handleStatusToggle}
          onEdit={onEdit}
          confirmDelete={confirmDelete}
        />
      ))}
    </div>
  );
}
