
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format, isToday, formatDistanceToNow } from 'date-fns';

interface MoodDetailModalProps {
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

const MoodDetailModal: React.FC<MoodDetailModalProps> = ({
  open,
  onClose,
  name,
  mood,
  note,
  timestamp
}) => {
  const formatTimestamp = (dateString: string) => {
    try {
      const date = new Date(dateString);
      
      if (isToday(date)) {
        return `Today at ${format(date, 'h:mm a')}`;
      } else {
        return `${format(date, 'MMM d, yyyy')} at ${format(date, 'h:mm a')} (${formatDistanceToNow(date, { addSuffix: true })})`;
      }
    } catch (e) {
      return 'Unknown time';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl">{name}'s Mood</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center text-center mb-4 pt-4">
          <div className="text-6xl mb-2">
            {mood.emoji}
          </div>
          <h3 className={`text-xl font-semibold ${mood.color}`}>
            {mood.label}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {formatTimestamp(timestamp)}
          </p>
        </div>
        
        {note && (
          <div className="mt-4 bg-muted/50 p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Thoughts:</h4>
            <p className="text-sm italic">"{note}"</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MoodDetailModal;
