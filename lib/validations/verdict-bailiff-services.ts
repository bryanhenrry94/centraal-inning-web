import { z } from "zod";

export const VerdictBailiffServicesSchema = z.object({
  id: z.string().uuid(),
  verdictId: z.string().uuid(),
  serviceType: z.string(),
  serviceCost: z.preprocess(
    (val) => (typeof val === "string" ? Number(val) : val),
    z.number()
  ),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const VerdictBailiffServicesCreateSchema =
  VerdictBailiffServicesSchema.omit({
    id: true,
    verdictId: true,
    createdAt: true,
    updatedAt: true,
  });

export type VerdictBailiffServicesCreate = z.infer<
  typeof VerdictBailiffServicesCreateSchema
>;

export type VerdictBailiffServices = z.infer<
  typeof VerdictBailiffServicesSchema
>;
