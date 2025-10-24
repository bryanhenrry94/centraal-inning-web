import { z } from "zod";

export const DebtorIncomeBaseSchema = z.object({
  id: z.string().uuid(), // Identificador único del ingreso
  debtor_id: z.string(), // Clave foránea que referencia a Debtor
  amount: z.number(), // Monto del ingreso
  source: z.string(), // Fuente del ingreso (ej. salario, alquiler, etc.)
  created_at: z.coerce.date(), // Fecha de creación
  updated_at: z.coerce.date(), // Fecha de última actualización
});

export const DebtorIncomeCreateSchema = DebtorIncomeBaseSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type DebtorIncomeBase = z.infer<typeof DebtorIncomeBaseSchema>;
export type DebtorIncomeCreate = z.infer<typeof DebtorIncomeCreateSchema>;
