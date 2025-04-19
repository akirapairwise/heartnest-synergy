
import React from 'react';
import { Goal } from '@/types/goals';
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GoalTableRow } from './GoalTableRow';

interface GoalsTableProps {
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

export function GoalsTable({
  goals,
  isSharedView,
  isPartnerView,
  isOwner,
  getOwnerLabel,
  getInitials,
  handleStatusToggle,
  onEdit,
  confirmDelete
}: GoalsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          {(isSharedView || isPartnerView) && <TableHead>Owner</TableHead>}
          <TableHead>Type</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {goals.map((goal) => (
          <GoalTableRow
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
      </TableBody>
    </Table>
  );
}
