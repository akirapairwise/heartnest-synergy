
import React from 'react';
import { Goal } from '@/types/goals';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GoalStatusBadge } from './GoalStatusBadge';
import { GoalCategoryBadge } from './GoalCategoryBadge';
import { Edit, Trash2, UserCircle2, Users } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface GoalCardProps {
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

export function GoalCard({
  goal,
  isSharedView,
  isPartnerView,
  isOwner,
  getOwnerLabel,
  getInitials,
  handleStatusToggle,
  onEdit,
  confirmDelete
}: GoalCardProps) {
  return (
    <Card key={goal.id} className="p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-medium flex items-center">
            {goal.is_shared && <Users className="h-4 w-4 mr-2 text-blue-500" />}
            {goal.title}
          </h3>
          {goal.description && <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>}
        </div>
        <GoalStatusBadge status={goal.status as any} />
      </div>
      
      <div className="flex flex-wrap gap-2 my-2">
        {(isSharedView || isPartnerView) && (
          <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
            {isOwner(goal) ? (
              <>
                <UserCircle2 className="h-3 w-3" />
                <span className="text-xs">You</span>
              </>
            ) : (
              <>
                <Avatar className="h-4 w-4">
                  <AvatarFallback className="text-[10px]">{getInitials("Partner")}</AvatarFallback>
                </Avatar>
                <span className="text-xs">{getOwnerLabel(goal)}</span>
              </>
            )}
          </div>
        )}
        <Badge variant={goal.is_shared ? "default" : "outline"} className={goal.is_shared ? "bg-blue-100 text-blue-800 hover:bg-blue-100" : ""}>
          {goal.is_shared ? "Shared" : "Personal"}
        </Badge>
        <GoalCategoryBadge category={goal.category as any} />
        <span className="text-xs bg-muted px-2 py-1 rounded-full">
          Created: {new Date(goal.created_at).toLocaleDateString()}
        </span>
      </div>
      
      {(isOwner(goal) || goal.is_shared) && (
        <div className="flex justify-end gap-2 mt-3">
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
        </div>
      )}
    </Card>
  );
}
