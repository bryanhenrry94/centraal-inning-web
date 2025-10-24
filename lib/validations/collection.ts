import { z } from "zod";
import { DebtorSchema } from "@/lib/validations/debtor";
import { PaymentSchema } from "@/lib/validations/payment";
import { $Enums } from "@/prisma/generated/prisma";

export const CollectionCaseSchema = z.object({
  id: z.cuid(),
  debtor_id: z.string(),
  amount_original: z.number(),
  amount_due: z.number(),
  amount_to_receive: z.number(),
  reference_number: z.string().optional(),
  issue_date: z.date().optional(),
  due_date: z.date().optional(),
  reminder1_due_date: z.date().optional(),
  reminder2_due_date: z.date().optional(),
  status: z
    .enum([
      $Enums.CollectionCaseStatus.PENDING,
      $Enums.CollectionCaseStatus.IN_PROGRESS,
      $Enums.CollectionCaseStatus.COMPLETED,
      $Enums.CollectionCaseStatus.CANCELLED,
    ])
    .default($Enums.CollectionCaseStatus.PENDING),
  tenant_id: z.string().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const CollectionCaseCreateSchema = CollectionCaseSchema.omit({
  id: true,
  tenant_id: true,
  created_at: true,
  updated_at: true,
});

export const CollectionCaseUpdateSchema = CollectionCaseSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
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
