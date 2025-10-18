import { z } from "zod";

export const VerdictEmbargoBaseSchema = z.object({
  id: z.string().uuid({ message: "El ID debe ser un UUID válido" }).optional(),
  verdictId: z
    .string()
    .uuid({ message: "El ID de Verdict debe ser un UUID válido" })
    .optional(),
  companyName: z
    .string()
    .min(1, { message: "El nombre de la empresa es obligatorio" }),
  companyPhone: z
    .string()
    .min(7, {
      message: "El teléfono de la empresa debe tener al menos 7 dígitos",
    })
    .max(20, {
      message: "El teléfono de la empresa debe tener como máximo 20 dígitos",
    }),
  companyEmail: z
    .string()
    .email({ message: "Correo electrónico de la empresa no válido" }),
  companyAddress: z
    .string()
    .min(1, { message: "La dirección de la empresa es obligatoria" }),
  embargoType: z
    .string()
    .min(1, { message: "El tipo de embargo es obligatorio" }),
  embargoDate: z.coerce.date({
    message: "La fecha de embargo debe ser una fecha válida",
  }),
  embargoAmount: z
    .number()
    .nonnegative({ message: "El monto del embargo debe ser no negativo" }),
  totalAmount: z
    .number()
    .nonnegative({ message: "El monto total debe ser no negativo" }),
  createdAt: z.coerce.date({
    message: "La fecha de creación debe ser una fecha válida",
  }),
  updatedAt: z.coerce.date({
    message: "La fecha de actualización debe ser una fecha válida",
  }),
});

export const VerdictEmbargoCreateSchema = VerdictEmbargoBaseSchema.omit({
  id: true,
  verdictId: true,
  createdAt: true,
  updatedAt: true,
});

export type VerdictEmbargo = z.infer<typeof VerdictEmbargoBaseSchema>;
export type VerdictEmbargoCreate = z.infer<typeof VerdictEmbargoCreateSchema>;
