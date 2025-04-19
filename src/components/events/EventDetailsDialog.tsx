
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

interface EventDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string | null;
  eventDate: Date;
  location?: string | null;
  daysToEvent: number;
  eventId: string;
  onEditClick: () => void;
  isCreator: boolean;
}

const EventDetailsDialog = ({
  open,
  onClose,
  title,
  description,
  eventDate,
  location,
  daysToEvent,
  onEditClick,
  isCreator,
}: EventDetailsDialogProps) => {
  const handleOpenLocation = () => {
    if (!location) return;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    window.open(mapsUrl, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="flex-row justify-between items-center">
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          {isCreator && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEditClick();
              }}
              className="h-8 w-8"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(eventDate, 'PPP')}</span>
            {daysToEvent >= 0 && (
              <span className="text-primary ml-2">
                {daysToEvent === 0 ? "(Today)" : 
                 daysToEvent === 1 ? "(Tomorrow)" : 
                 `(In ${daysToEvent} days)`}
              </span>
            )}
          </div>

          {location && (
            <Button
              variant="outline"
              className="w-full sm:w-auto flex items-center gap-2 text-muted-foreground hover:text-foreground"
              onClick={handleOpenLocation}
            >
              <MapPin className="h-4 w-4" />
              <span className="truncate">{location}</span>
            </Button>
          )}

          {description && (
            <div className="mt-4 text-sm text-muted-foreground">
              <p className="whitespace-pre-wrap">{description}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailsDialog;
