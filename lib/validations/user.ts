import { z } from "zod";

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().max(80).email(),
  passwordHash: z.string().max(120).nullable().optional(),
  fullname: z.string().max(80).nullable().optional(),
  phone: z.string().max(25).nullable().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const UserStatusSchema = z.object({
  status: z.enum(["active", "inactive", "pending", "cancelled"]),
});
