
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EventForm from './EventForm';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EventFormData } from './form/EventFormSchema';

interface EditEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  defaultValues: {
    title: string;
    description?: string | null;
    event_date: Date;
    event_time?: string | null;
    location?: string | null;
    locationCoords?: { lat?: number; lng?: number } | null;
    shared_with_partner: boolean;
  };
  onEventUpdated: () => void;
}

const EditEventDialog = ({ 
  open, 
  onOpenChange, 
  eventId, 
  defaultValues,
  onEventUpdated 
}: EditEventDialogProps) => {
  const handleSubmit = async (formData: EventFormData) => {
    try {
      // Extract event_time and locationCoords before sending to database
      const { event_time, locationCoords, ...restFormData } = formData;
      
      // Prepare location data if available
      const locationData = locationCoords && locationCoords.lat && locationCoords.lng ? {
        location_lat: locationCoords.lat,
        location_lng: locationCoords.lng
      } : {};
      
      const finalData = {
        ...restFormData,
        ...locationData,
        event_date: formData.event_date.toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('partner_events')
        .update(finalData)
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event updated successfully"
      });
      
      onEventUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-harmony-50 to-calm-50 p-6 -m-6 mb-2">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Edit Event</DialogTitle>
          </DialogHeader>
        </div>
        <EventForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          defaultValues={defaultValues}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditEventDialog;
