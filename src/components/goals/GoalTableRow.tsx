
import React from 'react';
import { Goal } from '@/types/goals';
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { GoalStatusBadge } from './GoalStatusBadge';
import { GoalCategoryBadge } from './GoalCategoryBadge';
import { Edit, Trash2, UserCircle2, Users } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface GoalTableRowProps {
  goal: Goal;
  isSharedView: boolean;
  isPartnerView: boolean;
  isOwner: (goal: Goal) => boolean;
  getOwnerLabel: (goal: Goal) => string;
  getInitials: (name: string) => string;
  handleStatusToggle: (goal: Goal) => Promise<void>;
  onEdit: (goal: Goal) => void;
  confirmDelete: (goalId: string) => void;
}

export function GoalTableRow({
  goal,
  isSharedView,
  isPartnerView,
  isOwner,
  getOwnerLabel,
  getInitials,
  handleStatusToggle,
  onEdit,
  confirmDelete
}: GoalTableRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex items-center">
          {goal.is_shared && <Users className="h-4 w-4 mr-2 text-blue-500" />}
          {goal.title}
        </div>
      </TableCell>
      {(isSharedView || isPartnerView) && (
        <TableCell>
          <div className="flex items-center gap-2">
            {isOwner(goal) ? (
              <div className="flex items-center">
                <UserCircle2 className="h-4 w-4 text-primary" />
                <span className="ml-1">You</span>
              </div>
            ) : (
              <div className="flex items-center">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">{getInitials("Partner")}</AvatarFallback>
                </Avatar>
                <span className="ml-1">{getOwnerLabel(goal)}</span>
              </div>
            )}
          </div>
        </TableCell>
      )}
      <TableCell>
        <Badge variant={goal.is_shared ? "default" : "outline"} className={goal.is_shared ? "bg-blue-100 text-blue-800 hover:bg-blue-100" : ""}>
          {goal.is_shared ? "Shared" : "Personal"}
        </Badge>
      </TableCell>
      <TableCell><GoalCategoryBadge category={goal.category as any} /></TableCell>
      <TableCell><GoalStatusBadge status={goal.status as any} /></TableCell>
      <TableCell>{new Date(goal.created_at).toLocaleDateString()}</TableCell>
      <TableCell className="text-right space-x-2">
        {(isOwner(goal) || goal.is_shared) && (
          <>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleStatusToggle(goal)}
            >
              {goal.status === 'completed' ? 'Reopen' : 'Complete'}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onEdit(goal)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            {isOwner(goal) && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => confirmDelete(goal.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </>
        )}
      </TableCell>
    </TableRow>
  );
}
