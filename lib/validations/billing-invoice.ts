import { z } from "zod";
import {
  BillingInvoiceDetailBaseSchema,
  BillingInvoiceDetailCreateSchema,
} from "@/lib/validations/billing-invoice-detail";
import { TenantSchema } from "./tenant";

export const BillingInvoiceBaseSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  subscriptionId: z.string().uuid().nullable().optional(),
  invoiceNumber: z.string(),
  amount: z.number(),
  currency: z.string().default("USD"),
  issueDate: z.preprocess(
    (val) =>
      typeof val === "string" || val instanceof Date ? new Date(val) : val,
    z.date()
  ),
  dueDate: z.preprocess(
    (val) =>
      typeof val === "string" || val instanceof Date ? new Date(val) : val,
    z.date().refine((date) => !isNaN(date.getTime()))
  ),
  description: z.string().nullable().optional(),
  status: z.enum(["unpaid", "paid", "overdue"]).default("unpaid"),
  invoiceDetails: z.array(BillingInvoiceDetailCreateSchema).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const BillingInvoiceCreateSchema = BillingInvoiceBaseSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const BillingInvoiceUpdateSchema = BillingInvoiceBaseSchema.pick({
  amount: true,
  currency: true,
  dueDate: true,
  status: true,
});

export const BillingInvoiceResponseSchema = BillingInvoiceBaseSchema.extend({
  invoiceDetails: z.array(BillingInvoiceDetailBaseSchema),
  payments: z.array(z.any()).optional(), // Replace z.any() with PaymentSchema if available
});

export const BillingInvoiceWithTenantSchema =
  BillingInvoiceResponseSchema.extend({
    tenant: TenantSchema,
  });

export type BillingInvoiceBase = z.infer<typeof BillingInvoiceBaseSchema>;
export type BillingInvoiceCreate = z.infer<typeof BillingInvoiceCreateSchema>;
export type BillingInvoiceUpdate = z.infer<typeof BillingInvoiceUpdateSchema>;
export type BillingInvoiceResponse = z.infer<
  typeof BillingInvoiceResponseSchema
>;
export type BillingInvoiceWithTenant = z.infer<
  typeof BillingInvoiceWithTenantSchema
>;
