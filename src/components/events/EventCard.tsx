
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Users } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { cn } from '@/lib/utils';
import EventDetailsDialog from './EventDetailsDialog';
import EditEventDialog from './EditEventDialog';
import { useAuth } from '@/contexts/AuthContext';

interface EventCardProps {
  id: string;
  title: string;
  description?: string | null;
  eventDate: Date;
  location?: string | null;
  daysToEvent: number;
  isShared: boolean;
  creatorId: string;
  onEventUpdated: () => void;
}

const EventCard = ({
  id,
  title,
  description,
  eventDate,
  location,
  daysToEvent,
  isShared,
  creatorId,
  onEventUpdated,
}: EventCardProps) => {
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const { user } = useAuth();
  const isUpcoming = !isPast(eventDate);
  const isCreator = user?.id === creatorId;

  const handleEditClick = () => {
    setIsDetailsOpen(false);
    setIsEditOpen(true);
  };

  return (
    <>
      <Card 
        className={cn(
          "overflow-hidden transition-all hover:shadow-md cursor-pointer",
          isUpcoming ? "border-primary/20" : "border-muted opacity-70"
        )}
        onClick={() => setIsDetailsOpen(true)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium leading-none">{title}</h3>
                {isShared && (
                  <Users className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{format(eventDate, 'PPP')}</span>
              </div>

              {location && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{location}</span>
                </div>
              )}

              {description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {description}
                </p>
              )}
            </div>

            {isUpcoming && (
              <div className="text-right">
                <div className="text-sm font-medium text-primary">
                  {daysToEvent === 0 ? (
                    "Today"
                  ) : daysToEvent === 1 ? (
                    "Tomorrow"
                  ) : (
                    `In ${daysToEvent} days`
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <EventDetailsDialog
        open={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title={title}
        description={description}
        eventDate={eventDate}
        location={location}
        daysToEvent={daysToEvent}
        eventId={id}
        onEditClick={handleEditClick}
        isCreator={isCreator}
      />

      <EditEventDialog
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        eventId={id}
        defaultValues={{
          title,
          description,
          event_date: eventDate,
          location,
          shared_with_partner: isShared
        }}
        onEventUpdated={onEventUpdated}
      />
    </>
  );
};

export default EventCard;
