import { z } from "zod";

export const PaymentMethodEnum = z.enum([
  "CASH",
  "TRANSFER",
  "CREDIT_CARD",
  "CHECK",
  "OTHER",
]);
export type PaymentMethod = z.infer<typeof PaymentMethodEnum>;

export const PaymentSchema = z.object({
  id: z.string(),
  collectionCaseId: z.string(),
  paymentDate: z
    .union([z.string(), z.date()])
    .transform((date) => (date instanceof Date ? date.toISOString() : date)),
  amount: z.preprocess(
    (val) => (typeof val === "string" ? Number(val) : val),
    z.number()
  ),
  method: PaymentMethodEnum,
  referenceNumber: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const PaymentCreateSchema = PaymentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Payment = z.infer<typeof PaymentSchema>;
export type PaymentCreate = z.infer<typeof PaymentCreateSchema>;
