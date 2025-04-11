
import React from 'react';
import { Goal } from '@/types/goals';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoalStatusBadge } from './GoalStatusBadge';
import { GoalCategoryBadge } from './GoalCategoryBadge';
import { Button } from "@/components/ui/button";
import { Edit, Trash2, User } from 'lucide-react';
import { updateGoalStatus } from '@/services/goalService';
import { useToast } from '@/components/ui/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface SharedGoalsListProps {
  goals: Goal[];
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
  onRefresh: () => void;
}

export function SharedGoalsList({ 
  goals, 
  onEdit, 
  onDelete, 
  onRefresh
}: SharedGoalsListProps) {
  const { toast } = useToast();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [goalToDelete, setGoalToDelete] = React.useState<string | null>(null);

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

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name || name === 'Unknown') return 'UN';
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  if (goals.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">
          No shared goals yet. Create a shared goal to get started!
        </p>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <>
        <div className="space-y-4">
          {goals.map((goal) => (
            <Card 
              key={goal.id} 
              className={`p-4 ${goal.is_self_owned ? 'border-l-primary border-l-4' : 'border-l-purple-500 border-l-4'}`}
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
                      Shared by {goal.owner_name || (goal.is_self_owned ? 'You' : 'Partner')}
                    </TooltipContent>
                  </Tooltip>
                  
                  <div>
                    <h3 className={`font-medium ${goal.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {goal.title}
                    </h3>
                    {goal.description && (
                      <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                    )}
                  </div>
                </div>
                <GoalStatusBadge status={goal.status as any} />
              </div>
              
              <div className="flex flex-wrap gap-2 my-2">
                <Badge 
                  variant={goal.is_self_owned ? "default" : "outline"}
                  className={goal.is_self_owned ? "bg-primary-100 text-primary hover:bg-primary-100" : ""}
                >
                  {goal.is_self_owned ? "Your Goal" : "Partner's Goal"}
                </Badge>
                <GoalCategoryBadge category={goal.category as any} />
                <span className="text-xs bg-muted px-2 py-1 rounded-full">
                  Created: {new Date(goal.created_at).toLocaleDateString()}
                </span>
              </div>
              
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
                {goal.is_self_owned && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => confirmDelete(goal.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the goal.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    </TooltipProvider>
  );
}
