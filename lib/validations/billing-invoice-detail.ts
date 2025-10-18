import { z } from "zod";

export const BillingInvoiceDetailBaseSchema = z.object({
  id: z.string().uuid(),
  invoiceId: z.string(),
  itemDescription: z.string(),
  itemQuantity: z.preprocess(
    (val) =>
      typeof val === "string" || typeof val === "number" ? Number(val) : val,
    z.number().int()
  ),
  itemUnitPrice: z.preprocess(
    (val) =>
      typeof val === "string" || typeof val === "number" ? Number(val) : val,
    z.number().min(0)
  ),
  itemTotalPrice: z.number(),
  itemTaxRate: z.number(),
  itemTaxAmount: z.number(),
  itemTotalWithTax: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const BillingInvoiceDetailCreateSchema =
  BillingInvoiceDetailBaseSchema.omit({
    id: true,
    invoiceId: true,
    createdAt: true,
    updatedAt: true,
  });

export type BillingInvoiceDetailBase = z.infer<
  typeof BillingInvoiceDetailBaseSchema
>;
export type BillingInvoiceDetailCreate = z.infer<
  typeof BillingInvoiceDetailCreateSchema
>;
