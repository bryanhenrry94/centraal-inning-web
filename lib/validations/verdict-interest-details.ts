import { z } from "zod";

export const VerdictInterestDetailSchema = z.object({
  id: z.string().uuid(),
  period: z.string().min(1),
  periodStart: z.date(),
  periodEnd: z.date(),
  days: z.number().int().min(0),
  annualRate: z.number(),
  proportionalRate: z.number(),
  baseAmount: z.number(),
  interest: z.number(),
  total: z.number(),
  verdictInterestId: z.string().uuid(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const VerdictInterestDetailCreateSchema =
  VerdictInterestDetailSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    verdictInterestId: true,
  });

export type VerdictInterestDetail = z.infer<typeof VerdictInterestDetailSchema>;
export type VerdictInterestDetailCreate = z.infer<
  typeof VerdictInterestDetailCreateSchema
>;
