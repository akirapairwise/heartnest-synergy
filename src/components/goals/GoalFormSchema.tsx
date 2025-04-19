
import * as z from "zod";

export const goalCategories = [
  { value: "communication", label: "Communication" },
  { value: "quality-time", label: "Quality Time" },
  { value: "adventure", label: "Adventure" },
  { value: "understanding", label: "Understanding" },
  { value: "growth", label: "Growth" },
  { value: "intimacy", label: "Intimacy" }
];

export const goalTypes = [
  { value: "personal", label: "Personal" },
  { value: "shared", label: "Shared" }
];

export const FormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.string().optional(),
  deadline: z.date().optional().nullable(),
  isShared: z.boolean().default(false),
  status: z.string().default("pending"),
  milestones: z.array(z.string()).default([])
});

export type GoalFormValues = z.infer<typeof FormSchema>;
