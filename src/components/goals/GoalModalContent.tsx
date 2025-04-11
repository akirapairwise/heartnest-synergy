
import React from 'react';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Goal } from "@/types/goals";
import GoalForm, { GoalFormValues } from './GoalForm';

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
  
  const Content = isDesktop ? DialogContent : DrawerContent;
  const Header = isDesktop ? DialogHeader : DrawerHeader;
  const Title = isDesktop ? DialogTitle : DrawerTitle;
  const Description = isDesktop ? DialogDescription : DrawerDescription;

  return (
    <Content>
      <Header>
        <Title>{goal ? 'Edit Goal' : 'Create New Goal'}</Title>
        <Description>
          {goal 
            ? 'Update your relationship goal details' 
            : 'Add a new goal to strengthen your relationship'}
        </Description>
      </Header>
      
      <GoalForm 
        goal={goal}
        onSubmit={onSubmit}
        onCancel={onClose}
        isSubmitting={isSubmitting}
      />
    </Content>
  );
}
