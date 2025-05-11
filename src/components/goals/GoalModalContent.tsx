
import React from 'react';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Goal } from "@/types/goals";
import GoalForm from './GoalForm';
import { GoalFormValues } from './GoalFormSchema';

interface GoalModalContentProps {
  goal?: Goal;
  isSubmitting: boolean;
  onSubmit: (values: GoalFormValues) => Promise<void>;
  onClose: () => void;
  isDesktop: boolean; // Pass isDesktop from parent instead of using the hook here
}

export function GoalModalContent({ 
  goal, 
  isSubmitting, 
  onSubmit, 
  onClose,
  isDesktop
}: GoalModalContentProps) {
  
  // Only return the content, not the wrapping Dialog/Drawer component
  // The parent component will handle the Dialog/Drawer wrapping
  if (isDesktop) {
    return (
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-semibold">{goal ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
          <DialogDescription className="text-sm md:text-base text-muted-foreground">
            {goal 
              ? 'Update your relationship goal details' 
              : 'Add a new goal to strengthen your relationship'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          <GoalForm 
            goal={goal}
            onSubmit={onSubmit}
            onCancel={onClose}
            isSubmitting={isSubmitting}
          />
        </div>
      </DialogContent>
    );
  }
  
  // Mobile drawer version
  return (
    <DrawerContent className="max-h-[85vh] overflow-hidden">
      <DrawerHeader className="pb-2">
        <DrawerTitle className="text-xl font-semibold">{goal ? 'Edit Goal' : 'Create New Goal'}</DrawerTitle>
        <DrawerDescription className="text-sm md:text-base text-muted-foreground">
          {goal 
            ? 'Update your relationship goal details' 
            : 'Add a new goal to strengthen your relationship'}
        </DrawerDescription>
      </DrawerHeader>
      
      <div className="px-4 flex-1 overflow-hidden">
        <GoalForm 
          goal={goal}
          onSubmit={onSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
        />
      </div>
    </DrawerContent>
  );
}
