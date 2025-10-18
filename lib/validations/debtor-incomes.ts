import { z } from "zod";

export const DebtorIncomeBaseSchema = z.object({
  id: z.string().uuid(), // Identificador único del ingreso
  debtorId: z.string(), // Clave foránea que referencia a Debtor
  amount: z.number(), // Monto del ingreso
  source: z.string(), // Fuente del ingreso (ej. salario, alquiler, etc.)
  createdAt: z.coerce.date(), // Fecha de creación
  updatedAt: z.coerce.date(), // Fecha de última actualización
});

export const DebtorIncomeCreateSchema = DebtorIncomeBaseSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type DebtorIncomeBase = z.infer<typeof DebtorIncomeBaseSchema>;
export type DebtorIncomeCreate = z.infer<typeof DebtorIncomeCreateSchema>;
