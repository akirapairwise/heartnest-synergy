import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Calendar, MapPin, MoreHorizontal, Heart, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { isEventPast, getEventStatusColor } from './utils/eventStatus';
import EditEventDialog from './EditEventDialog';
import EventDetailsDialog from './EventDetailsDialog';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EventCardProps {
  id: string;
  title: string;
  description?: string | null;
  eventDate: Date;
  location?: string | null;
  locationCoords?: { lat: number; lng: number } | null;
  daysToEvent: number;
  isShared?: boolean;
  creatorId: string;
  onEventUpdated?: () => void;
  onArchive?: () => void;
  feedback?: string | null;
  hasFeedback?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({
  id,
  title,
  description,
  eventDate,
  location,
  locationCoords,
  daysToEvent,
  isShared = false,
  creatorId,
  onEventUpdated,
  onArchive,
  feedback,
  hasFeedback
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const { user } = useAuth();
  
  const isCreator = user?.id === creatorId;
  const isPast = isEventPast(eventDate);
  
  const handleArchive = async () => {
    try {
      const { error } = await supabase
        .from('partner_events')
        .update({ is_archived: true })
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Event archived",
        description: "The event has been moved to archives"
      });
      
      if (onArchive) onArchive();
    } catch (error) {
      console.error('Error archiving event:', error);
      toast({
        title: "Error",
        description: "Failed to archive event",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <Card 
        className={cn(
          "overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer border",
          isPast ? "bg-muted/30 border-muted" : "bg-card"
        )}
        onClick={() => setIsDetailsDialogOpen(true)}
      >
        <CardContent className="p-0">
          <div className="flex items-start">
            {/* Date indicator */}
            <div 
              className={cn(
                "shrink-0 w-[80px] sm:w-24 py-3 px-2 flex flex-col items-center justify-center text-center border-r",
                getEventStatusColor(daysToEvent)
              )}
            >
              <div className="text-xl font-bold">{format(eventDate, 'd')}</div>
              <div className="text-xs uppercase">{format(eventDate, 'MMM')}</div>
              {!isPast && daysToEvent <= 3 && (
                <div className="mt-1 text-xs font-medium px-1.5 py-0.5 rounded-full bg-white/50">
                  {daysToEvent === 0 ? 'Today!' : daysToEvent === 1 ? 'Tomorrow' : `${daysToEvent} days`}
                </div>
              )}
            </div>
            
            {/* Event details */}
            <div className="flex-1 p-3 sm:p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium mb-1">{title}</h3>
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {format(eventDate, 'h:mm a')}
                    </span>
                  </div>
                  
                  {location && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate max-w-[200px]">{location}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  {isPast && hasFeedback && (
                    <span 
                      className="text-xs inline-flex items-center gap-0.5 text-primary font-medium"
                      title="Has feedback"
                    >
                      <CheckCircle2 className="h-3 w-3 text-primary" />
                    </span>
                  )}
                  
                  {isShared && (
                    <span 
                      className="text-xs inline-flex items-center gap-0.5 text-rose-500"
                      title="Shared with partner"
                    >
                      <Heart className="h-3 w-3 text-rose-500" />
                    </span>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsDetailsDialogOpen(true);
                        }}
                      >
                        View Details
                      </DropdownMenuItem>
                      
                      {isCreator && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEditDialogOpen(true);
                          }}
                        >
                          Edit Event
                        </DropdownMenuItem>
                      )}
                      
                      {isCreator && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleArchive();
                            }}
                          >
                            Archive Event
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <EditEventDialog 
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        eventId={id}
        defaultValues={{
          title,
          description,
          event_date: eventDate,
          location,
          locationCoords: locationCoords || undefined,
          shared_with_partner: isShared
        }}
        onEventUpdated={() => {
          if (onEventUpdated) onEventUpdated();
        }}
      />
      
      <EventDetailsDialog
        open={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        title={title}
        description={description}
        eventDate={eventDate}
        location={location}
        locationCoords={locationCoords}
        daysToEvent={daysToEvent}
        eventId={id}
        onEditClick={() => {
          setIsDetailsDialogOpen(false);
          setIsEditDialogOpen(true);
        }}
        isCreator={isCreator}
        feedback={feedback}
        hasFeedback={hasFeedback}
        onFeedbackSaved={onEventUpdated}
      />
    </>
  );
};

export default EventCard;
