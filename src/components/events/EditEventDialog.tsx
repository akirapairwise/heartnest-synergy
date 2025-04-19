
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EventForm from './EventForm';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EditEventDialogProps {
  open: boolean;
  onClose: () => void;
  eventId: string;
  defaultValues: {
    title: string;
    description?: string | null;
    event_date: Date;
    location?: string | null;
    shared_with_partner: boolean;
  };
  onEventUpdated: () => void;
}

const EditEventDialog = ({ 
  open, 
  onClose, 
  eventId, 
  defaultValues,
  onEventUpdated 
}: EditEventDialogProps) => {
  const handleSubmit = async (formData: any) => {
    try {
      // Include both date and time in the event_date field
      const { event_time, ...restFormData } = formData;
      const finalData = {
        ...restFormData,
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
      onClose();
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-harmony-50 to-calm-50 p-6 -m-6 mb-2">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Edit Event</DialogTitle>
          </DialogHeader>
        </div>
        <EventForm
          onSubmit={handleSubmit}
          onCancel={onClose}
          defaultValues={defaultValues}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditEventDialog;
