import { z } from "zod";
import { VerdictInterestDetailCreateSchema } from "./verdict-interest-details";

export const VerdictInterestBaseSchema = z.object({
  id: z.string().uuid({ message: "El id debe ser un UUID válido" }),
  interestType: z.number().int("El tipo de interés debe ser un número entero"),
  baseAmount: z.coerce
    .number()
    .nonnegative({ message: "El monto base debe ser un número positivo" }),
  calculatedInterest: z
    .preprocess(
      (val) => (typeof val === "string" ? Number(val) : val),
      z.number()
    )
    .optional(),
  calculationStart: z.date(),
  calculationEnd: z.date(),
  totalInterest: z.number(),
  details: z.array(VerdictInterestDetailCreateSchema),
});

export const VerdictInterestSchema = VerdictInterestBaseSchema.extend({
  id: z.string().uuid({ message: "El id debe ser un UUID válido" }),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const VerdictInterestCreateSchema = VerdictInterestSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type IVerdictInterest = z.infer<typeof VerdictInterestSchema>;
export type IVerdictInterestCreate = z.infer<
  typeof VerdictInterestCreateSchema
>;
