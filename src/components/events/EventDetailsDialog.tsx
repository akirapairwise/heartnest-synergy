
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Edit, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

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

  // Function to get tag class based on days remaining
  const getCountdownTagClass = () => {
    if (daysToEvent === 0) return "bg-primary text-primary-foreground animate-pulse-soft";
    if (daysToEvent === 1) return "bg-primary/90 text-primary-foreground";
    if (daysToEvent <= 3) return "bg-primary/80 text-primary-foreground";
    return "bg-muted text-muted-foreground";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-xl p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-love-50 to-harmony-50 p-6">
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
                className="h-8 w-8 rounded-full bg-white/80 hover:bg-white"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </DialogHeader>
          
          <div className="space-y-4 mt-6">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-full p-2 shadow-sm">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-foreground font-medium">{format(eventDate, 'PPP')}</div>
                {daysToEvent >= 0 && (
                  <span className={cn(
                    "inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium",
                    getCountdownTagClass()
                  )}>
                    {daysToEvent === 0 ? "Today!" : 
                     daysToEvent === 1 ? "Tomorrow" : 
                     `In ${daysToEvent} days`}
                  </span>
                )}
              </div>
            </div>

            {location && (
              <div className="flex items-center gap-3">
                <div className="bg-white rounded-full p-2 shadow-sm">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <Button
                  variant="link"
                  className="p-0 h-auto text-foreground hover:text-primary font-medium underline-offset-4"
                  onClick={handleOpenLocation}
                >
                  {location}
                </Button>
              </div>
            )}

            {description && (
              <div className="mt-6 bg-white/80 rounded-xl p-4 shadow-sm">
                <h4 className="text-sm uppercase tracking-wide text-muted-foreground mb-2">Details</h4>
                <p className="whitespace-pre-wrap text-foreground">{description}</p>
              </div>
            )}

            <div className="flex justify-center mt-2">
              <Heart className="h-5 w-5 text-love-500 animate-pulse-soft" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailsDialog;
