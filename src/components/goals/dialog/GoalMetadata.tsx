
import React from 'react';
import { CalendarIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Goal } from '@/types/goals';

interface GoalMetadataProps {
  goal: Goal;
}

export function GoalMetadata({ goal }: GoalMetadataProps) {
  return (
    <>
      {goal.deadline && (
        <div className="flex items-center gap-2 text-sm">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <span>
            Deadline: {new Date(goal.deadline).toLocaleDateString()}
          </span>
        </div>
      )}
      
      {goal.is_shared && (
        <div className="pt-2">
          <Badge variant="outline" className="flex items-center gap-1">
            {goal.is_self_owned ? "Created by you" : `Shared by ${goal.owner_name || 'Partner'}`}
          </Badge>
        </div>
      )}
      
      <div className="text-xs text-muted-foreground">
        Created: {new Date(goal.created_at).toLocaleDateString()}
      </div>
    </>
  );
}
