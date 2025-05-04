import React, { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EventCard from './EventCard';
import EventForm from './EventForm';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useNavigate } from 'react-router-dom';

interface EventWithFeedback {
  id: string;
  title: string;
  description: string | null;
  creator_id: string;
  location: string | null;
  event_date: string;
  shared_with_partner: boolean;
  created_at: string;
  updated_at: string;
  days_to_event: number;
  feedback?: string | null;
  has_feedback?: boolean;
}

const UpcomingEventsSection = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [eventsKey, setEventsKey] = useState(0); // To force refetch
  const fabRef = useRef<HTMLButtonElement>(null);
  const { user, profile } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const { data: events, isLoading, refetch } = useQuery({
    queryKey: ['upcoming-events', user?.id, profile?.partner_id, eventsKey],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        // Fetch events with countdown
        const { data: eventsData, error: eventsError } = await supabase
          .from('partner_events_with_countdown')
          .select('*')
          .or(`creator_id.eq.${user.id}${profile?.partner_id ? `,and(creator_id.eq.${profile.partner_id},shared_with_partner.eq.true)` : ''}`)
          .eq('is_archived', false)
          .order('event_date', { ascending: true });
        
        if (eventsError) throw eventsError;
        
        // For past events, fetch additional feedback data
        const eventsWithFeedback: EventWithFeedback[] = [];
        
        for (const event of eventsData) {
          // Fetch feedback for this event if it exists
          // Use type assertion to temporarily bypass TypeScript error
          const { data: feedbackData } = await (supabase
            .from('event_feedback' as any)
            .select('feedback')
            .eq('event_id', event.id)
            .single() as any);
          
          eventsWithFeedback.push({
            ...event,
            feedback: feedbackData?.feedback || null,
            has_feedback: feedbackData?.feedback ? true : false
          });
        }
        
        return eventsWithFeedback;
      } catch (error) {
        console.error('Error fetching events:', error);
        throw error;
      }
    },
    enabled: !!user,
  });

  // Filter for nearest upcoming event
  const nearestEvent = React.useMemo(() => {
    if (!events || events.length === 0) return null;
    
    const upcomingEvents = events.filter(event => event.days_to_event >= 0)
      .sort((a, b) => a.days_to_event - b.days_to_event);
    
    return upcomingEvents.length > 0 ? upcomingEvents[0] : null;
  }, [events]);

  const handleCreateEvent = async (formData: any) => {
    try {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create events",
          variant: "destructive"
        });
        return;
      }

      // Log the data we're about to save
      console.log('Creating event with data:', {
        ...formData,
        creator_id: user.id,
        event_date: formData.event_date instanceof Date ? formData.event_date.toISOString() : formData.event_date,
      });

      // Make sure we have a valid date
      if (!(formData.event_date instanceof Date)) {
        toast({
          title: "Error",
          description: "Invalid event date format",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('partner_events')
        .insert([{
          title: formData.title,
          description: formData.description || null,
          location: formData.location || null,
          shared_with_partner: formData.shared_with_partner || false,
          creator_id: user.id,
          event_date: formData.event_date.toISOString(),
        }]);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Event created successfully"
      });
      
      setIsCreateDialogOpen(false);
      refetch();
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive"
      });
    }
  };

  const EventFormContainer = (
    <EventForm
      onSubmit={handleCreateEvent}
      onCancel={() => setIsCreateDialogOpen(false)}
    />
  );

  const handleEventArchived = () => {
    // Force refetch of events by changing the query key
    setEventsKey(prev => prev + 1);
  };

  const navigateToSuggestions = () => {
    navigate('/event-suggestions');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold font-heading text-primary">Upcoming Events</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 rounded-xl">
              <div className="space-y-3">
                <div className="h-4 w-1/4 bg-muted animate-pulse rounded-full" />
                <div className="h-4 w-1/2 bg-muted animate-pulse rounded-full" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {nearestEvent && (
        <div className="bg-gradient-to-r from-love-50 to-harmony-50 rounded-xl p-4 mb-6 shadow-sm border border-love-100 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-love-600">Coming up</span>
              <span className="inline-block px-2 py-0.5 bg-white rounded-full text-xs font-medium text-primary shadow-sm">
                {nearestEvent.days_to_event === 0 ? "Today!" : 
                 nearestEvent.days_to_event === 1 ? "Tomorrow" : 
                 `In ${nearestEvent.days_to_event} days`}
              </span>
            </div>
          </div>
          <div className="mt-1 font-medium">{nearestEvent.title}</div>
          <div className="text-sm text-muted-foreground">{new Date(nearestEvent.event_date).toLocaleDateString()}</div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold font-heading text-primary">
          What are you both looking forward to?
        </h2>
        <div className="flex gap-2">
          <Button 
            onClick={navigateToSuggestions}
            variant="gradient"
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Get Suggestions</span>
          </Button>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="gap-2 rounded-full bg-primary hover:bg-primary/90 transition-transform duration-300 hover:scale-105 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Event</span>
          </Button>
        </div>
      </div>

      <div className="space-y-4 mt-6">
        {events?.length === 0 ? (
          <Card className="p-6 text-center rounded-xl bg-muted/20">
            <p className="text-muted-foreground mb-3">No upcoming events</p>
            <div className="sm:hidden flex justify-center">
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
              >
                Create Event
              </Button>
            </div>
          </Card>
        ) : (
          events?.map((event) => (
            <EventCard
              key={event.id}
              id={event.id}
              title={event.title}
              description={event.description}
              eventDate={new Date(event.event_date)}
              location={event.location}
              daysToEvent={event.days_to_event}
              isShared={event.shared_with_partner}
              creatorId={event.creator_id}
              feedback={event.feedback}
              hasFeedback={event.has_feedback}
              onEventUpdated={refetch}
              onArchive={handleEventArchived} // Add archive handler
            />
          ))
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed right-6 bottom-6 z-10 md:hidden"
      >
        <div className="flex flex-col gap-2 items-end">
          <Button
            onClick={navigateToSuggestions}
            size="icon"
            className="rounded-full w-12 h-12 shadow-lg bg-gradient-to-r from-purple-500 to-primary hover:shadow-xl transition-all duration-300"
          >
            <Sparkles className="h-5 w-5" />
          </Button>
          <Button
            ref={fabRef}
            onClick={() => setIsCreateDialogOpen(true)}
            size="icon"
            className="rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-love-500 to-primary hover:shadow-xl transition-all duration-300"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </motion.div>

      {isMobile ? (
        <Drawer open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DrawerContent className="max-h-[90vh] overflow-y-auto flex flex-col px-3 pb-3">
            <div className="bg-gradient-to-r from-love-50 to-harmony-50 p-4 rounded-t-xl sticky top-0 z-10">
              <DrawerHeader className="p-0">
                <DrawerTitle className="text-xl font-semibold">Create New Event</DrawerTitle>
              </DrawerHeader>
            </div>
            <div className="flex-1 overflow-y-auto pb-2">
              {EventFormContainer}
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[500px] rounded-xl overflow-hidden p-0">
            <div className="bg-gradient-to-r from-love-50 to-harmony-50 p-6 -m-6 mb-2">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">Create New Event</DialogTitle>
              </DialogHeader>
            </div>
            <div className="max-h-[70vh] overflow-y-auto px-2 pb-4">
              {EventFormContainer}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default UpcomingEventsSection;
