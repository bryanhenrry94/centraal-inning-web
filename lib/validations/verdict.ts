import { z } from "zod";
import { VerdictInterestCreateSchema } from "@/lib/validations/verdict-interest";
import { DebtorBaseSchema } from "@/lib/validations/debtor";
import {
  VerdictEmbargoBaseSchema,
  VerdictEmbargoCreateSchema,
} from "./verdict-embargo";
import { VerdictAttachmentSchema } from "./verdict-attachments";
import { VerdictBailiffServicesCreateSchema } from "./verdict-bailiff-services";

// Enum for VerdictStatus
export const VerdictStatusEnum = z.enum([
  "DRAFT",
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

// Verdict schema
const VerdictBaseSchema = z.object({
  id: z.string().uuid({ message: "El id debe ser un UUID válido." }),
  invoiceNumber: z.string().max(100),
  creditorName: z.string().max(100, {
    message: "El nombre del acreedor no debe exceder 100 caracteres.",
  }),
  debtorId: z.string(),
  registrationNumber: z.string().max(100, {
    message: "El número de registro no debe exceder 100 caracteres.",
  }),
  sentenceAmount: z.preprocess(
    (val) => (typeof val === "string" ? Number(val) : val),
    z.number()
  ),
  sentenceDate: z.preprocess(
    (val) =>
      typeof val === "string" || val instanceof Date ? new Date(val) : val,
    z.date()
  ),
  procesalCost: z.preprocess(
    (val) => (typeof val === "string" ? Number(val) : val),
    z.number().optional()
  ),
  verdictInterest: z.array(VerdictInterestCreateSchema).optional(),
  verdictEmbargo: z.array(VerdictEmbargoCreateSchema).optional(),
  bailiffId: z.preprocess(
    (val) => (val === "" ? null : val),
    z
      .string()
      .uuid({ message: "El id del alguacil debe ser un UUID válido." })
      .nullable()
  ),
  bailiffServices: z.array(VerdictBailiffServicesCreateSchema).optional(),
  status: VerdictStatusEnum,
  attachments: z.array(VerdictAttachmentSchema).optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const VerdictSchema = VerdictBaseSchema.superRefine((data, ctx) => {});

export const VerdictCreateSchema = VerdictBaseSchema.omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export const VerdictCreateForm = z.object({
  ...VerdictCreateSchema.shape,
});

export const VerdictUpdateSchema = VerdictBaseSchema.partial().extend({});

export const VerdictResponseSchema = VerdictBaseSchema.extend({
  debtor: DebtorBaseSchema,
  verdictInterest: z.array(VerdictInterestCreateSchema),
  verdictEmbargo: z.array(VerdictEmbargoBaseSchema),
});

// Types
export type VerdictStatus = z.infer<typeof VerdictStatusEnum>;
export type Verdict = z.infer<typeof VerdictSchema>;
export type VerdictResponse = z.infer<typeof VerdictResponseSchema>;
export type VerdictCreate = z.infer<typeof VerdictCreateSchema>;
export type VerdictUpdate = z.infer<typeof VerdictUpdateSchema>;
