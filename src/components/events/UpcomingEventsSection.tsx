import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EventCard from './EventCard';
import EventForm from './EventForm';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const UpcomingEventsSection = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const { user } = useAuth();

  const { data: events, isLoading, refetch } = useQuery({
    queryKey: ['upcoming-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partner_events_with_countdown')
        .select('*')
        .order('event_date', { ascending: true })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

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

      const { error } = await supabase
        .from('partner_events')
        .insert([{
          ...formData,
          creator_id: user.id,
          event_date: formData.event_date.toISOString(),
        }]);

      if (error) throw error;

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
        description: "Failed to create event",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Upcoming Events</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <div className="space-y-3">
                <div className="h-4 w-1/4 bg-muted animate-pulse rounded" />
                <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Upcoming Events</h2>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Event
        </Button>
      </div>

      <div className="space-y-4">
        {events?.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">No upcoming events</p>
            <Button 
              variant="link" 
              onClick={() => setIsCreateDialogOpen(true)}
              className="mt-2"
            >
              Create your first event
            </Button>
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
              onEventUpdated={refetch}
            />
          ))
        )}
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
          </DialogHeader>
          <EventForm
            onSubmit={handleCreateEvent}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UpcomingEventsSection;
