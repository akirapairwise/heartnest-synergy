
import React from 'react';
import { X } from "lucide-react";
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";

interface MoodModalProps {
  open: boolean;
  onClose: () => void;
  name: string;
  mood: {
    emoji: string;
    label: string;
    color: string;
  };
  note: string | null;
  timestamp: string;
}

const MoodDetailModal: React.FC<MoodModalProps> = ({ open, onClose, name, mood, note, timestamp }) => {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[425px] rounded-xl bg-gradient-to-b from-white to-gray-50">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{name}'s Mood for Today</DialogTitle>
          <DialogClose className="absolute right-4 top-4">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        <div className="flex flex-col items-center p-6">
          <div className="text-6xl mb-4 animate-pulse-soft" aria-label={`Mood: ${mood.label}`}>
            {mood.emoji}
          </div>
          <h3 className={`text-xl font-bold ${mood.color} mb-2`}>{mood.label}</h3>
          
          {note && (
            <div className="mt-4 text-center w-full">
              <div className="p-4 rounded-lg bg-white/80 shadow-sm border border-gray-100">
                <p className="text-sm text-muted-foreground mb-1 font-medium">Note:</p>
                <p className="text-base italic">"{note}"</p>
              </div>
            </div>
          )}
          
          <p className="text-xs text-muted-foreground mt-6">
            Logged at {format(new Date(timestamp), 'h:mm a')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MoodDetailModal;
