
import React from 'react';
import { Goal } from '@/types/goals';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GoalStatusBadge } from './GoalStatusBadge';
import { Edit, Eye, Trash2, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SharedGoalItemProps {
  goal: Goal;
  getInitials: (name: string) => string;
  handleStatusToggle: (goal: Goal) => Promise<void>;
  openDetails: (goal: Goal) => void;
  onEdit: (goal: Goal) => void;
  confirmDelete: (goalId: string) => void;
  isOwner: (goal: Goal) => boolean;
}

export function SharedGoalItem({
  goal,
  getInitials,
  handleStatusToggle,
  openDetails,
  onEdit,
  confirmDelete,
  isOwner
}: SharedGoalItemProps) {
  return (
    <Card 
      key={goal.id} 
      className={`p-4 hover:shadow-md transition-shadow cursor-pointer ${goal.is_self_owned ? 'border-l-primary border-l-4' : 'border-l-purple-500 border-l-4'}`}
      onClick={() => openDetails(goal)}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-start gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="mt-1">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs bg-muted">
                    {getInitials(goal.owner_name || '')}
                  </AvatarFallback>
                </Avatar>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {goal.is_self_owned ? 'Created by you' : `Shared by ${goal.owner_name || 'Partner'}`}
            </TooltipContent>
          </Tooltip>
          
          <div>
            <h3 className={`font-medium ${goal.completed ? 'line-through text-muted-foreground' : ''}`}>
              {goal.title}
            </h3>
            {goal.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{goal.description}</p>
            )}
          </div>
        </div>
        <GoalStatusBadge status={goal.status as any} />
      </div>
      
      <div className="flex flex-wrap gap-2 mt-3">
        <span className="text-xs bg-muted px-2 py-1 rounded-full">
          {new Date(goal.created_at).toLocaleDateString()}
        </span>
        <Badge variant="outline" className="text-xs">
          {goal.is_self_owned ? "Your Goal" : "Partner's Goal"}
        </Badge>
      </div>
      
      <div className="flex justify-end gap-2 mt-3" onClick={e => e.stopPropagation()}>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={(e) => {
            e.stopPropagation();
            openDetails(goal);
          }}
        >
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={(e) => {
            e.stopPropagation();
            handleStatusToggle(goal);
          }}
        >
          {goal.status === 'completed' ? 'Reopen' : 'Complete'}
        </Button>
        {goal.is_self_owned && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              confirmDelete(goal.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Card>
  );
}
