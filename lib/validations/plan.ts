import { z } from "zod";

export const planSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1),
  price: z.number(),
  description: z.string().optional(),
  duration_days: z.number().int().nonnegative(),
  is_active: z.boolean().default(true),
});

// Schema for creating a Plan (id is omitted because it's generated)
export const planCreateSchema = planSchema.omit({ id: true }).extend({
  is_active: z.boolean().optional().default(true),
});

// Schema for updating a Plan (all fields optional)
export const planUpdateSchema = planCreateSchema.partial().extend({
  id: z.string().cuid().optional(),
});

export type Plan = z.infer<typeof planSchema>;
