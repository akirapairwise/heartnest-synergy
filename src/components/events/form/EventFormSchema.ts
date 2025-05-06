
import { z } from 'zod';

export const eventFormSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters' }),
  description: z.string().optional(),
  event_date: z.date(),
  event_time: z.string().optional(),
  location: z.string().optional(),
  locationCoords: z.object({
    lat: z.number().optional(),
    lng: z.number().optional()
  }).optional().nullable(),
  shared_with_partner: z.boolean().default(false),
});

export type EventFormData = z.infer<typeof eventFormSchema>;
