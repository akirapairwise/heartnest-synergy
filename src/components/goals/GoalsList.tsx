
import React from 'react';
import { Goal } from '@/types/goals';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GoalStatusBadge } from './GoalStatusBadge';
import { GoalCategoryBadge } from './GoalCategoryBadge';
import { Card } from "@/components/ui/card";
import { Edit, Trash2 } from 'lucide-react';
import { updateGoalStatus } from '@/services/goalService';
import { useToast } from '@/components/ui/use-toast';
import { useMediaQuery } from '@/hooks/use-media-query';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface GoalsListProps {
  goals: Goal[];
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
  onRefresh: () => void;
}

export function GoalsList({ goals, onEdit, onDelete, onRefresh }: GoalsListProps) {
  const { toast } = useToast();
  const isDesktop = useMediaQuery("(min-width: 768px)");
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
  
  if (goals.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">No goals found. Create one to get started!</p>
      </Card>
    );
  }

  return (
    <>
      {isDesktop ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {goals.map((goal) => (
              <TableRow key={goal.id}>
                <TableCell className="font-medium">{goal.title}</TableCell>
                <TableCell><GoalCategoryBadge category={goal.category as any} /></TableCell>
                <TableCell><GoalStatusBadge status={goal.status as any} /></TableCell>
                <TableCell>{new Date(goal.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right space-x-2">
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
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => confirmDelete(goal.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => (
            <Card key={goal.id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{goal.title}</h3>
                  {goal.description && <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>}
                </div>
                <GoalStatusBadge status={goal.status as any} />
              </div>
              
              <div className="flex flex-wrap gap-2 my-2">
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
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => confirmDelete(goal.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

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
  );
}
