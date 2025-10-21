import { z } from "zod";

export const InstallmentSchema = z.object({
  id: z.string().cuid(),
  paymentAgreementId: z.string().cuid(),
  number: z.number().int().nonnegative(),
  dueDate: z.coerce.date(),
  amount: z.number(),
  status: z.string().default("PENDING"),
  paymentId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export type Installment = z.infer<typeof InstallmentSchema>;
