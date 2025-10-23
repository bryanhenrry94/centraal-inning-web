import { z } from "zod";

export const PaymentAgreementSchema = z.object({
  id: z.string().cuid(),
  collectionCaseId: z.string(),
  tenantId: z.uuid(),
  totalAmount: z.number(),
  installmentAmount: z.number(),
  installmentsCount: z.number().int(),
  startDate: z.date(),
  comment: z.string().optional().nullable(),
  status: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  debtorId: z.string().nullable().optional(),
});

export const PaymentAgreementCreateSchema = PaymentAgreementSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
});

export const PaymentAgreementUpdateSchema =
  PaymentAgreementCreateSchema.partial();

export const PaymentAgreementResponseSchema = PaymentAgreementSchema.extend({
  collectionCase: z.object({
    id: z.string().cuid(),
    referenceNumber: z.string(),
    issueDate: z.date().optional().nullable(),
  }),
  debtor: z
    .object({
      id: z.string().cuid(),
      fullname: z.string(),
      email: z.string().email().optional().nullable(),
      phone: z.string().optional().nullable(),
    })
    .nullable()
    .optional(),
});

export type PaymentAgreement = z.infer<typeof PaymentAgreementSchema>;
export type PaymentAgreementResponse = z.infer<
  typeof PaymentAgreementResponseSchema
>;
export type PaymentAgreementCreate = z.infer<
  typeof PaymentAgreementCreateSchema
>;
export type PaymentAgreementUpdate = z.infer<
  typeof PaymentAgreementUpdateSchema
>;
