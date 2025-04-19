
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
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-love-50 to-harmony-50 p-4 rounded-xl border border-love-100/50 shadow-sm mb-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-love-600 via-harmony-600 to-calm-600 bg-clip-text text-transparent">Relationship Goals</h1>
        <p className="text-muted-foreground">Track and achieve your relationship aspirations together</p>
      </div>
      
      <div className="flex items-center gap-2">
        {isDesktop ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button onClick={handleOpenNewGoal} variant="gradient">
                <Plus className="mr-2 h-4 w-4" />
                Add New Goal
              </Button>
            </DialogTrigger>
          </Dialog>
        ) : (
          <Drawer>
            <DrawerTrigger asChild>
              <Button onClick={handleOpenNewGoal} variant="gradient">
                <Plus className="mr-2 h-4 w-4" />
                Add New Goal
              </Button>
            </DrawerTrigger>
          </Drawer>
        )}
        
        <Button variant="outline" size="icon" onClick={fetchGoals} disabled={isLoading} className="border-harmony-200 hover:bg-harmony-100/50">
          <RefreshCw className={`h-4 w-4 text-harmony-600 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      {/* Render the goal modal separately to maintain proper component hierarchy */}
      {goalModalOpen && (
        <GoalModal
          onClose={handleCloseModal}
          onSuccess={onSuccess}
        />
      )}
    </div>
  );
}
