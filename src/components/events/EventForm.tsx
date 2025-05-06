
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { eventFormSchema, EventFormData } from './form/EventFormSchema';
import TitleDescriptionInputs from './form/TitleDescriptionInputs';
import DateTimeInputs from './form/DateTimeInputs';
import LocationInput from './form/LocationInput';
import PartnerSharingToggle from './form/PartnerSharingToggle';
import FormButtons from './form/FormButtons';
import EventPreviewCard from './EventPreviewCard';
import { GeocodingResult } from '@/utils/googleMapsUtils';

interface EventFormProps {
  onSubmit: (data: EventFormData) => void;
  onCancel: () => void;
  defaultValues?: {
    title: string;
    description?: string | null;
    event_date: Date;
    event_time?: string | null;
    location?: string | null;
    locationCoords?: { lat?: number; lng?: number } | null;
    shared_with_partner: boolean;
  };
}

const EventForm = ({ onSubmit, onCancel, defaultValues }: EventFormProps) => {
  const [selectedLocation, setSelectedLocation] = useState<GeocodingResult | null>(null);
  
  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
      event_date: defaultValues?.event_date ?? new Date(),
      event_time: defaultValues?.event_time ?? undefined,
      location: defaultValues?.location ?? '',
      locationCoords: defaultValues?.locationCoords ?? null,
      shared_with_partner: defaultValues?.shared_with_partner ?? false,
    },
  });

  const watchedFields = form.watch();

  const handleLocationSelect = (location: GeocodingResult | null) => {
    setSelectedLocation(location);
    if (location) {
      form.setValue('location', location.address);
      form.setValue('locationCoords', {
        lat: location.coordinates.lat,
        lng: location.coordinates.lng
      });
    } else {
      form.setValue('location', '');
      form.setValue('locationCoords', null);
    }
  };

  const handleSubmit = (data: EventFormData) => {
    if (data.event_time) {
      const [hours, minutes] = data.event_time.split(':').map(Number);
      const dateWithTime = new Date(data.event_date);
      dateWithTime.setHours(hours, minutes);
      data.event_date = dateWithTime;
    }
    onSubmit(data);
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid gap-4 sm:gap-6">
            {/* Title and Description */}
            <TitleDescriptionInputs form={form} />

            {/* Date and Time */}
            <DateTimeInputs form={form} />

            {/* Location */}
            <LocationInput 
              form={form} 
              onLocationSelect={handleLocationSelect} 
            />

            {/* Partner Sharing Toggle */}
            <PartnerSharingToggle form={form} />

            {/* Preview Card */}
            {watchedFields.title && (
              <EventPreviewCard
                title={watchedFields.title}
                eventDate={watchedFields.event_date}
                eventTime={watchedFields.event_time}
                location={watchedFields.location}
                sharedWithPartner={watchedFields.shared_with_partner}
              />
            )}
          </div>

          {/* Form Buttons */}
          <FormButtons 
            onCancel={onCancel} 
            isEditMode={!!defaultValues} 
          />
        </form>
      </Form>
    </div>
  );
};

export default EventForm;
