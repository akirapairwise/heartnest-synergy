
import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare } from "lucide-react";
import ConflictResponseForm from './ConflictResponseForm';
import { Conflict } from '@/types/conflicts';

type ConflictResponseDialogProps = {
  conflict: Conflict;
  onSuccess: () => void;
};

const ConflictResponseDialog = ({ conflict, onSuccess }: ConflictResponseDialogProps) => {
  const [open, setOpen] = React.useState(false);
  
  const handleSuccess = () => {
    setOpen(false);
    onSuccess();
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <MessageSquare className="mr-2 h-4 w-4" />
          Respond
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Respond to Conflict</DialogTitle>
          <DialogDescription>
            Share your perspective on this conflict to work toward a resolution.
          </DialogDescription>
        </DialogHeader>
        <ConflictResponseForm conflict={conflict} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default ConflictResponseDialog;
