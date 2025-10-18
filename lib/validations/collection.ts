import { z } from "zod";
import { DebtorSchema } from "@/lib/validations/debtor";
import { PaymentSchema } from "@/lib/validations/payment";

export const CollectionCaseSchema = z.object({
  id: z.cuid(),
  debtorId: z.string(),
  amountOriginal: z.number(),
  amountDue: z.number(),
  amountToReceive: z.number(),
  referenceNumber: z.string().optional(),
  issueDate: z.date().optional(),
  dueDate: z.date().optional(),
  status: z
    .enum(["PENDING", "IN_PROGRESS", "PAID", "OVERDUE", "CANCELLED"])
    .default("PENDING"),
  tenantId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CollectionCaseCreateSchema = CollectionCaseSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
});

export const CollectionCaseUpdateSchema = CollectionCaseSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const CollectionCaseResponseSchema = CollectionCaseSchema.extend({
  debtor: DebtorSchema,
});

export const CollectionCaseViewSchema = CollectionCaseSchema.extend({
  debtor: DebtorSchema,
  payments: PaymentSchema.array(),
  // You can add agreements, notifications, penalties schemas here if needed
});

export type CollectionCase = z.infer<typeof CollectionCaseSchema>;
export type CollectionCaseCreate = z.infer<typeof CollectionCaseCreateSchema>;
export type CollectionCaseUpdate = z.infer<typeof CollectionCaseUpdateSchema>;
export type CollectionCaseResponse = z.infer<
  typeof CollectionCaseResponseSchema
>;
export type CollectionCaseView = z.infer<typeof CollectionCaseViewSchema>;
