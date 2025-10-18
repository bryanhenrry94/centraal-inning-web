import { z } from "zod";
import { DebtorBaseSchema } from "@/lib/validations/debtor";

export const DebtorContributionSchema = z.object({
  id: z.string().uuid(),
  debtorId: z.string(),
  debtor: DebtorBaseSchema.nullable().optional(),
  companyId: z.string(),
  companyName: z.string().nullable().optional(),
  companyContact: z.string().nullable().optional(),
  companyEmail: z.string().email().nullable().optional(),
  companyPhone: z.string().nullable().optional(),
  extraInfo: z.string().nullable().optional(),
  verificationStatus: z
    .enum(["pending", "verified", "rejected", "contributed", "accepted"])
    .default("pending"),
  createdByUserId: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  isPublic: z.boolean().default(false),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const CreateDebtorContributionSchema = z.object({
  debtorId: z.string(),
  notes: z.string().nullable().optional(),
  isPublic: z.boolean().default(false),
});

export const PartialCompanyContributionSchema = z.object({
  companyName: z.string().nullable().optional(),
  companyContact: z.string().nullable().optional(),
  companyEmail: z.string().email().nullable().optional(),
  companyPhone: z.string().nullable().optional(),
  extraInfo: z.string().nullable().optional(),
});

export const UpdateDebtorContributionStatusSchema = z.object({
  status: z.enum([
    "pending",
    "verified",
    "rejected",
    "contributed",
    "accepted",
  ]),
  notes: z.string().nullable().optional(),
});

export const DebtorContributionStatusQuerySchema = z.object({
  status: z
    .enum(["pending", "verified", "rejected", "contributed", "accepted"])
    .optional(),
});

export type IDebtorContribution = z.infer<typeof DebtorContributionSchema>;
export type ICreateDebtorContribution = z.infer<
  typeof CreateDebtorContributionSchema
>;
export type IUpdateDebtorContributionStatus = z.infer<
  typeof UpdateDebtorContributionStatusSchema
>;
export type IPartialCompanyContribution = z.infer<
  typeof PartialCompanyContributionSchema
>;
export type IDebtorContributionStatusQuery = z.infer<
  typeof DebtorContributionStatusQuerySchema
>;
