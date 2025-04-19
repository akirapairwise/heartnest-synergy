
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Goal } from "@/types/goals";
import GoalForm from './GoalForm';
import { GoalFormValues } from './GoalFormSchema';

interface GoalModalContentProps {
  goal?: Goal;
  isSubmitting: boolean;
  onSubmit: (values: GoalFormValues) => Promise<void>;
  onClose: () => void;
}

export function GoalModalContent({ 
  goal, 
  isSubmitting, 
  onSubmit, 
  onClose 
}: GoalModalContentProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  
  // Only render the appropriate content based on screen size
  if (isDesktop) {
    return (
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold">{goal ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
          <DialogDescription className="text-sm md:text-base text-muted-foreground">
            {goal 
              ? 'Update your relationship goal details' 
              : 'Add a new goal to strengthen your relationship'}
          </DialogDescription>
        </DialogHeader>
        
        <GoalForm 
          goal={goal}
          onSubmit={onSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    );
  }
  
  // Mobile drawer version
  return (
    <DrawerContent className="h-[85vh]">
      <DrawerHeader className="pb-4">
        <DrawerTitle className="text-xl font-semibold">{goal ? 'Edit Goal' : 'Create New Goal'}</DrawerTitle>
        <DrawerDescription className="text-sm md:text-base text-muted-foreground">
          {goal 
            ? 'Update your relationship goal details' 
            : 'Add a new goal to strengthen your relationship'}
        </DrawerDescription>
      </DrawerHeader>
      
      <div className="px-4">
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
