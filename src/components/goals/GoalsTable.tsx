
import React from 'react';
import { Goal } from '@/types/goals';
import { GoalStatusBadge } from './GoalStatusBadge';
import { GoalCategoryBadge } from './GoalCategoryBadge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Table, TableHeader, TableBody, TableHead, 
  TableRow, TableCell 
} from '@/components/ui/table';
import { 
  Edit, Trash2, CheckCircle2, Circle, 
  AlertCircle, Calendar, Eye
} from 'lucide-react';

interface GoalsTableProps {
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

export function GoalsTable({ 
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
}: GoalsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Goal</TableHead>
            <TableHead className="w-[150px]">Status</TableHead>
            {isSharedView && (
              <TableHead className="w-[120px]">Owner</TableHead>
            )}
            <TableHead className="w-[120px]">Category</TableHead>
            <TableHead className="w-[100px]">Deadline</TableHead>
            <TableHead className="w-[100px]">Progress</TableHead>
            <TableHead className="w-[120px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {goals.map((goal) => (
            <TableRow key={goal.id} className={goal.status === 'completed' ? "bg-muted/40" : ""}>
              <TableCell className="font-medium">
                <div className="flex items-center">
                  <button
                    className="text-left hover:underline focus:outline-none focus:underline w-full overflow-hidden"
                    onClick={() => openDetails(goal)}
                  >
                    <span className={goal.status === 'completed' ? "line-through text-muted-foreground" : ""}>
                      {goal.title}
                    </span>
                  </button>
                </div>
              </TableCell>
              
              <TableCell>
                <GoalStatusBadge status={goal.status as any} />
              </TableCell>
              
              {isSharedView && (
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs bg-primary/10">
                        {getInitials(getOwnerLabel(goal))}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{getOwnerLabel(goal)}</span>
                  </div>
                </TableCell>
              )}
              
              <TableCell>
                {goal.category ? (
                  <GoalCategoryBadge category={goal.category as any} />
                ) : (
                  <span className="text-muted-foreground text-sm">None</span>
                )}
              </TableCell>
              
              <TableCell>
                {goal.deadline ? (
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>
                      {new Date(goal.deadline).toLocaleDateString()}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">None</span>
                )}
              </TableCell>
              
              <TableCell>
                {goal.milestones && goal.milestones.length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-1">
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
                ) : (
                  <span className="text-muted-foreground text-sm">No milestones</span>
                )}
              </TableCell>
              
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => openDetails(goal)}
                    className="h-8 w-8"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View Details</span>
                  </Button>
                
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
