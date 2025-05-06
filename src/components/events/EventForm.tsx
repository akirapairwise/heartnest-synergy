
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Info, Users } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import TimePickerField from './TimePickerField';
import EventPreviewCard from './EventPreviewCard';
import { useMediaQuery } from '@/hooks/use-media-query';
import { DrawerContent, Drawer, DrawerTrigger } from '@/components/ui/drawer';
import LocationSearch from './LocationSearch';
import { GeocodingResult } from '@/utils/googleMapsUtils';
import LocationMapPreview from './LocationMapPreview';

const formSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters' }),
  description: z.string().optional(),
  event_date: z.date(),
  event_time: z.string().optional(),
  location: z.string().optional(),
  locationCoords: z.object({
    lat: z.number(),
    lng: z.number()
  }).optional(),
  shared_with_partner: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

interface EventFormProps {
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  defaultValues?: {
    title: string;
    description?: string | null;
    event_date: Date;
    event_time?: string | null;
    location?: string | null;
    locationCoords?: { lat: number; lng: number } | null;
    shared_with_partner: boolean;
  };
}

const EventForm = ({ onSubmit, onCancel, defaultValues }: EventFormProps) => {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [selectedLocation, setSelectedLocation] = useState<GeocodingResult | null>(null);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
      event_date: defaultValues?.event_date ?? new Date(),
      event_time: defaultValues?.event_time ?? undefined,
      location: defaultValues?.location ?? '',
      locationCoords: defaultValues?.locationCoords ?? undefined,
      shared_with_partner: defaultValues?.shared_with_partner ?? false,
    },
  });

  const watchedFields = form.watch();

  const handleLocationSelect = (location: GeocodingResult | null) => {
    setSelectedLocation(location);
    if (location) {
      form.setValue('location', location.address);
      form.setValue('locationCoords', location.coordinates);
    } else {
      form.setValue('location', '');
      form.setValue('locationCoords', undefined);
    }
  };

  const handleSubmit = (data: FormData) => {
    if (data.event_time) {
      const [hours, minutes] = data.event_time.split(':').map(Number);
      const dateWithTime = new Date(data.event_date);
      dateWithTime.setHours(hours, minutes);
      data.event_date = dateWithTime;
    }
    onSubmit(data);
  };

  const DatePickerContent = (
    <Calendar
      mode="single"
      selected={form.getValues("event_date")}
      onSelect={(date) => date && form.setValue("event_date", date)}
      initialFocus
      className="p-3 pointer-events-auto"
    />
  );

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid gap-4 sm:gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Event Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter event title" 
                      {...field} 
                      className="rounded-lg text-base focus:ring-primary focus:border-primary transition-all"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add some details about your event" 
                      className="min-h-[80px] sm:min-h-[100px] rounded-lg focus:ring-primary focus:border-primary transition-all resize-none"
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <FormField
                control={form.control}
                name="event_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-base">Date</FormLabel>
                    {isMobile ? (
                      <Drawer>
                        <DrawerTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "pl-3 text-left font-normal rounded-lg w-full",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </DrawerTrigger>
                        <DrawerContent className="p-0">
                          <div className="p-4 bg-background">
                            <h4 className="font-medium text-center mb-4">Select Date</h4>
                            {DatePickerContent}
                          </div>
                        </DrawerContent>
                      </Drawer>
                    ) : (
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "pl-3 text-left font-normal rounded-lg",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          {DatePickerContent}
                        </PopoverContent>
                      </Popover>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <TimePickerField form={form} />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Location (Optional)</FormLabel>
                  <FormControl>
                    <LocationSearch 
                      value={field.value || ''}
                      onLocationSelect={handleLocationSelect}
                      placeholder="Search for a location"
                    />
                  </FormControl>
                  <FormMessage />
                  {field.value && (
                    <LocationMapPreview 
                      locationName={field.value} 
                      coordinates={form.getValues('locationCoords')}
                      className="mt-2" 
                    />
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shared_with_partner"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between p-3 sm:p-4 rounded-lg border bg-muted/20">
                  <div className="space-y-0.5">
                    <div className="flex items-center">
                      <FormLabel className="text-sm sm:text-base cursor-pointer">Share with Partner</FormLabel>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full ml-2">
                              <Info className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            When turned on, this event will appear in your partner's calendar too.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <FormMessage />
                  </div>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-primary"
                      />
                      <AnimatePresence>
                        {field.value && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center"
                          >
                            <Users className="h-4 w-4 text-primary" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

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

          <div className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              className="rounded-lg"
            >
              {defaultValues ? 'Update Event' : 'Create Event'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EventForm;
