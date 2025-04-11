
import { z } from 'zod';

export const FormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().optional(),
  category: z.string().optional(),
  deadline: z.date().optional(),
  isShared: z.boolean().default(false),
  status: z.string().default('pending'),
  milestones: z.array(z.string()).default([]),
});

export type GoalFormValues = z.infer<typeof FormSchema>;

export const goalCategories = [
  { value: 'communication', label: 'Communication' },
  { value: 'quality-time', label: 'Quality Time' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'understanding', label: 'Understanding' },
  { value: 'growth', label: 'Growth' },
  { value: 'intimacy', label: 'Intimacy' },
];
