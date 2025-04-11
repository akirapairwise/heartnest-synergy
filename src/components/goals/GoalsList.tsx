
import React from 'react';
import { Goal } from '@/types/goals';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GoalStatusBadge } from './GoalStatusBadge';
import { GoalCategoryBadge } from './GoalCategoryBadge';
import { Card } from "@/components/ui/card";
import { Edit, Trash2, UserCircle2, Users } from 'lucide-react';
import { updateGoalStatus } from '@/services/goalService';
import { useToast } from '@/components/ui/use-toast';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useAuth } from '@/contexts/AuthContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface GoalsListProps {
  goals: Goal[];
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
  onRefresh: () => void;
  isSharedView?: boolean;
  isPartnerView?: boolean;
  partnerId?: string | null;
}

export function GoalsList({ 
  goals, 
  onEdit, 
  onDelete, 
  onRefresh, 
  isSharedView = false,
  isPartnerView = false,
  partnerId
}: GoalsListProps) {
  const { toast } = useToast();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [goalToDelete, setGoalToDelete] = React.useState<string | null>(null);
  const { user, profile } = useAuth();

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
  
  const isOwner = (goal: Goal) => {
    return goal.owner_id === user?.id;
  };
  
  const getOwnerLabel = (goal: Goal) => {
    if (isOwner(goal)) {
      return "You";
    } else if (goal.owner_id === profile?.partner_id) {
      return "Partner"; // Using a generic "Partner" label instead of partner_name
    } else {
      return "Unknown";
    }
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || 'PA';
  };
  
  if (goals.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">
          {isSharedView 
            ? "No shared goals found. Create a shared goal to get started!" 
            : isPartnerView
              ? "Your partner hasn't shared any goals with you yet."
              : "No goals found. Create one to get started!"}
        </p>
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
              <TableRow key={goal.id}>
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
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => (
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
