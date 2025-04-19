
import React from 'react';
import { Goal } from '@/types/goals';
import { GoalStatusBadge } from './GoalStatusBadge';
import { GoalCategoryBadge } from './GoalCategoryBadge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { 
  Edit, Trash2, CheckCircle2, Circle, 
  Calendar, Eye, User 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface GoalsCardListProps {
  goals: Goal[];
  isSharedView?: boolean;
  isPartnerView?: boolean;
  isOwner: (goal: Goal) => boolean;
  getOwnerLabel: (goal: Goal) => string;
  getInitials: (name: string) => string;
  handleStatusToggle: (goal: Goal) => Promise<void>;
  onEdit: (goal: Goal) => void;
  confirmDelete: (goalId: string) => void;
  openDetails: (goal: Goal) => void;
}

export function GoalsCardList({ 
  goals,
  isSharedView = false,
  isPartnerView = false,
  isOwner,
  getOwnerLabel,
  getInitials,
  handleStatusToggle,
  onEdit,
  confirmDelete,
  openDetails
}: GoalsCardListProps) {
  return (
    <div className="space-y-4">
      {goals.map((goal) => (
        <Card key={goal.id} className={goal.status === 'completed' ? "bg-muted/40" : ""}>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <button 
                  className="text-left font-medium hover:underline focus:outline-none focus:underline break-words mr-2"
                  onClick={() => openDetails(goal)}
                >
                  <span className={goal.status === 'completed' ? "line-through text-muted-foreground" : ""}>
                    {goal.title}
                  </span>
                </button>
                <GoalStatusBadge status={goal.status as any} className="flex-shrink-0" />
              </div>
              
              <div className="flex flex-wrap gap-2 items-center">
                {goal.category && (
                  <GoalCategoryBadge category={goal.category as any} />
                )}
                
                {isSharedView && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{getOwnerLabel(goal)}</span>
                  </Badge>
                )}
                
                {goal.deadline && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(goal.deadline).toLocaleDateString()}</span>
                  </Badge>
                )}
              </div>
              
              {goal.milestones && goal.milestones.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Progress</span>
                    <span className="text-xs text-muted-foreground">
                      {goal.completed_milestones?.length || 0}/{goal.milestones.length}
                    </span>
                  </div>
                  <Progress 
                    value={goal.completed_milestones ? 
                      (goal.completed_milestones.length / goal.milestones.length) * 100 : 0
                    } 
                    className="h-1.5" 
                  />
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="px-4 py-3 border-t flex justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => openDetails(goal)}
              className="h-8 px-2"
            >
              <Eye className="h-4 w-4 mr-1" />
              <span>Details</span>
            </Button>
            
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => handleStatusToggle(goal)}
                className="h-8 w-8"
              >
                {goal.status === 'completed' ? (
                  <Circle className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {goal.status === 'completed' ? 'Mark as incomplete' : 'Mark as complete'}
                </span>
              </Button>
              
              {(isOwner(goal) || (!isPartnerView && !isSharedView)) && (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onEdit(goal)}
                    className="h-8 w-8"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => confirmDelete(goal.id)}
                    className="h-8 w-8 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </>
              )}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
