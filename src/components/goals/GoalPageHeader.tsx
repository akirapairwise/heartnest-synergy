
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { useMediaQuery } from '@/hooks/use-media-query';
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerTrigger } from "@/components/ui/drawer";
import { GoalModal } from '@/components/goals/GoalModal';

interface GoalPageHeaderProps {
  isLoading: boolean;
  goalModalOpen: boolean;
  setGoalModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleOpenNewGoal: () => void;
  fetchGoals: () => Promise<void>;
  handleCloseModal: () => void;
  onSuccess: () => void;
}

export function GoalPageHeader({ 
  isLoading, 
  goalModalOpen, 
  setGoalModalOpen, 
  handleOpenNewGoal, 
  fetchGoals,
  handleCloseModal,
  onSuccess
}: GoalPageHeaderProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold mb-2">Relationship Goals</h1>
        <p className="text-muted-foreground">Track and achieve your relationship aspirations together</p>
      </div>
      
      <div className="flex items-center gap-2">
        {isDesktop ? (
          <Dialog open={goalModalOpen} onOpenChange={setGoalModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenNewGoal}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Goal
              </Button>
            </DialogTrigger>
            {goalModalOpen && (
              <GoalModal
                onClose={handleCloseModal}
                onSuccess={onSuccess}
              />
            )}
          </Dialog>
        ) : (
          <Drawer open={goalModalOpen} onOpenChange={setGoalModalOpen}>
            <DrawerTrigger asChild>
              <Button onClick={handleOpenNewGoal}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Goal
              </Button>
            </DrawerTrigger>
            {goalModalOpen && (
              <GoalModal
                onClose={handleCloseModal}
                onSuccess={onSuccess}
              />
            )}
          </Drawer>
        )}
        
        <Button variant="outline" size="icon" onClick={fetchGoals} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </div>
  );
}
