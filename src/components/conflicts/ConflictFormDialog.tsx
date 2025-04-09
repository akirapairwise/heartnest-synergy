
import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import ConflictForm from './ConflictForm';

type ConflictFormDialogProps = {
  partnerId: string;
  onSuccess: () => void;
};

const ConflictFormDialog = ({ partnerId, onSuccess }: ConflictFormDialogProps) => {
  const [open, setOpen] = React.useState(false);
  
  const handleSuccess = () => {
    setOpen(false);
    onSuccess();
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Record Conflict
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record a New Conflict</DialogTitle>
          <DialogDescription>
            Document a relationship conflict to work toward a resolution together.
          </DialogDescription>
        </DialogHeader>
        <ConflictForm partnerId={partnerId} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default ConflictFormDialog;
