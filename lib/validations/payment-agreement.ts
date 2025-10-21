import { z } from "zod";

export const PaymentAgreementSchema = z.object({
  id: z.string().cuid(),
  collectionCaseId: z.string(),
  totalAmount: z.number(),
  installmentAmount: z.number(),
  installmentsCount: z.number().int(),
  startDate: z.date(),
  status: z.string(),
  complianceStatus: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  debtorId: z.string().nullable().optional(),
});

export const PaymentAgreementCreateSchema = PaymentAgreementSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const PaymentAgreementUpdateSchema =
  PaymentAgreementCreateSchema.partial();

export type PaymentAgreement = z.infer<typeof PaymentAgreementSchema>;
export type PaymentAgreementCreate = z.infer<
  typeof PaymentAgreementCreateSchema
>;
export type PaymentAgreementUpdate = z.infer<
  typeof PaymentAgreementUpdateSchema
>;
