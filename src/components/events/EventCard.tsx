
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Users, Heart, Film, Plane, Music, Gift, PartyPopper, Star, Clock } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { cn } from '@/lib/utils';
import EventDetailsDialog from './EventDetailsDialog';
import EditEventDialog from './EditEventDialog';
import { useAuth } from '@/contexts/AuthContext';
import { isEventPast } from './utils/eventStatus';

interface EventCardProps {
  id: string;
  title: string;
  description?: string | null;
  eventDate: Date;
  location?: string | null;
  daysToEvent: number;
  isShared: boolean;
  creatorId: string;
  feedback?: string | null;
  hasFeedback?: boolean;
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
  feedback,
  hasFeedback,
  onEventUpdated,
}: EventCardProps) => {
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const { user } = useAuth();
  const isUpcoming = !isEventPast(eventDate);
  const isCreator = user?.id === creatorId;

  const handleEditClick = () => {
    setIsDetailsOpen(false);
    setIsEditOpen(true);
  };

  const handleFeedbackSaved = () => {
    onEventUpdated();
  };

  // Get appropriate event icon
  const getEventIcon = () => {
    // Simple logic to determine icon based on title keywords
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('anniversary') || titleLower.includes('date') || titleLower.includes('romantic')) {
      return <Heart className="h-5 w-5 text-love-500" />;
    } else if (titleLower.includes('movie') || titleLower.includes('cinema') || titleLower.includes('film')) {
      return <Film className="h-5 w-5 text-calm-500" />;
    } else if (titleLower.includes('trip') || titleLower.includes('travel') || titleLower.includes('vacation')) {
      return <Plane className="h-5 w-5 text-harmony-500" />;
    } else if (titleLower.includes('concert') || titleLower.includes('music')) {
      return <Music className="h-5 w-5 text-purple-500" />;
    } else if (titleLower.includes('birthday') || titleLower.includes('gift')) {
      return <Gift className="h-5 w-5 text-pink-500" />;
    } else if (titleLower.includes('party') || titleLower.includes('celebration')) {
      return <PartyPopper className="h-5 w-5 text-amber-500" />;
    } else {
      return <Star className="h-5 w-5 text-primary" />;
    }
  };

  // Generate card gradient based on event type
  const getCardStyle = () => {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('anniversary') || titleLower.includes('date') || titleLower.includes('romantic')) {
      return 'bg-gradient-to-br from-white to-love-50/60 border-love-100';
    } else if (titleLower.includes('movie') || titleLower.includes('cinema')) {
      return 'bg-gradient-to-br from-white to-calm-50/60 border-calm-100';
    } else if (titleLower.includes('trip') || titleLower.includes('travel')) {
      return 'bg-gradient-to-br from-white to-harmony-50/60 border-harmony-100';
    } else if (titleLower.includes('concert') || titleLower.includes('music')) {
      return 'bg-gradient-to-br from-white to-purple-50/60 border-purple-100';
    } else if (titleLower.includes('birthday') || titleLower.includes('gift')) {
      return 'bg-gradient-to-br from-white to-pink-50/60 border-pink-100';
    } else if (titleLower.includes('party') || titleLower.includes('celebration')) {
      return 'bg-gradient-to-br from-white to-amber-50/60 border-amber-100';
    } else {
      return 'bg-gradient-to-br from-white to-primary-50/30';
    }
  };

  return (
    <>
      <Card 
        className={cn(
          "overflow-hidden transition-all hover:shadow-md cursor-pointer rounded-xl animate-fade-in",
          getCardStyle(),
          isUpcoming ? "" : "opacity-80"
        )}
        onClick={() => setIsDetailsOpen(true)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                {getEventIcon()}
                <h3 className="font-medium leading-none text-lg">{title}</h3>
                {isShared && (
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    <Users className="h-3 w-3 mr-1" />
                    Shared
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{format(eventDate, 'PPP')}</span>
                {!isUpcoming && (
                  <span className="inline-flex items-center ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                    <Clock className="h-3 w-3 mr-1" />
                    Past
                  </span>
                )}
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
              
              {!isUpcoming && hasFeedback && (
                <div className="text-xs text-muted-foreground italic mt-1">
                  Has reflection
                </div>
              )}
            </div>

            {isUpcoming && (
              <div className="text-right">
                <div className={cn(
                  "text-sm font-medium px-3 py-1 rounded-full",
                  daysToEvent === 0 ? "bg-primary/10 text-primary" : 
                  daysToEvent === 1 ? "bg-primary/15 text-primary" :
                  daysToEvent <= 3 ? "bg-primary/20 text-primary" :
                  "bg-muted text-muted-foreground"
                )}>
                  {daysToEvent === 0 ? (
                    "Today!"
                  ) : daysToEvent === 1 ? (
                    "Tomorrow"
                  ) : (
                    `In ${daysToEvent} days`
                  )}
                </div>
              </div>
            )}
            
            {!isUpcoming && (
              <div className="text-right">
                <div className="text-sm font-medium px-3 py-1 rounded-full bg-muted text-muted-foreground">
                  {Math.abs(daysToEvent)} days ago
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
        feedback={feedback}
        hasFeedback={hasFeedback}
        onFeedbackSaved={handleFeedbackSaved}
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
