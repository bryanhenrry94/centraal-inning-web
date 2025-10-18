import { z } from "zod";

export const CalculationTypeEnumSchema = z.enum(["FIXED", "VARIABLE"]);

export const InterestDetailSchema = z.object({
  id: z.number(), // Identificador único del detalle de interés
  date: z.string(), // Fecha del detalle de interés
  rate: z.number(), // Tasa de interés
  interestTypeId: z.number(), // Clave foránea a InterestType
  // interestType is omitted to avoid circular reference
});

export const InterestTypeSchema = z.object({
  id: z.number(), // Identificador único del tipo de interés
  name: z.string(), // Nombre del tipo de interés
  calculationType: CalculationTypeEnumSchema, // Tipo de cálculo (fijo o variable)
  details: z.array(InterestDetailSchema), // Relación uno a muchos con InterestDetail
});

export const InterestTypeCreateSchema = InterestTypeSchema.omit({
  id: true,
});

// Export TypeScript types inferred from the schemas
export type InterestDetail = z.infer<typeof InterestDetailSchema>;
export type InterestType = z.infer<typeof InterestTypeSchema>;
export type InterestTypeCreate = z.infer<typeof InterestTypeCreateSchema>;
