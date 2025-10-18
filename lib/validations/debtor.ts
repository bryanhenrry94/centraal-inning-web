import { z } from "zod";
import { DebtorIncomeCreateSchema } from "./debtor-incomes";
import { UserSchema } from "@/lib/validations/user";

// Esquema base para Debtor con validaciones en español
export const DebtorBaseSchema = z.object({
  id: z.uuid({ message: "El identificador debe ser un UUID válido." }),
  tenantId: z.string(),
  userId: z.string().optional(),
  fullname: z.string().min(3, {
    message: "El nombre completo debe tener al menos 3 caracteres.",
  }),
  email: z.email({ message: "El correo electrónico no es válido." }),
  phone: z
    .string()
    .min(7, { message: "El teléfono debe tener al menos 7 dígitos." })
    .max(20, { message: "El teléfono no debe exceder 20 caracteres." })
    .optional(),
  address: z
    .string()
    .max(255, { message: "La dirección no debe exceder 255 caracteres." })
    .optional(),
  personType: z
    .enum(["individual", "company"], {
      message: "El tipo de persona debe ser 'natural' o 'empresa'.",
    })
    .optional(),
  identificationType: z
    .enum(["DNI", "PASSPORT", "NIE", "CIF", "KVK", "OTHER"], {
      message:
        "El tipo de identificación debe ser 'DNI', 'PASSPORT', 'NIE', 'CIF', 'KVK' o 'OTHER'.",
    })
    .optional(),
  identification: z
    .string()
    .max(13, { message: "La identificación no debe exceder 13 caracteres." })
    .optional(),
  totalIncome: z
    .preprocess(
      (val) => (typeof val === "string" ? Number(val) : val),
      z.number()
    )
    .optional(),
  incomes: z.array(DebtorIncomeCreateSchema).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Esquema para crear un Debtor (CRUD), omitiendo campos automáticos y relacionales
export const DebtorCreateSchema = DebtorBaseSchema.omit({
  id: true,
  tenantId: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const DebtorResponseSchema = DebtorBaseSchema.extend({
  user: UserSchema.optional(),
});

export const DebtorSchema = DebtorBaseSchema.omit({
  tenantId: true,
  userId: true,
  totalIncome: true,
  incomes: true,
  createdAt: true,
  updatedAt: true,
});

// Enum de tipos de identificación
export enum IdentificationType {
  DNI = "DNI", /// Documento Nacional de Identidad (España)
  PASSPORT = "PASSPORT", /// Pasaporte internacional
  NIE = "NIE", /// Número de Identidad de Extranjero (España)
  // Identificación empresarial
  CIF = "CIF", /// Código de Identificación Fiscal (España, empresas)
  KVK = "KVK", /// Número de registro de la Cámara de Comercio (Países Bajos, empresas)
  //
  OTHER = "OTHER", /// Otro tipo de identificación
}
export type DebtorBase = z.infer<typeof DebtorBaseSchema>;
export type DebtorCreate = z.infer<typeof DebtorCreateSchema>;
export type DebtorResponse = z.infer<typeof DebtorResponseSchema>;
