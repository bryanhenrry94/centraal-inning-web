import { $Enums } from "@/prisma/generated/prisma";
import { z } from "zod";

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().max(80).email(),
  password_hash: z.string().max(120).nullable().optional(),
  fullname: z.string().max(80).nullable().optional(),
  phone: z.string().max(25).nullable().optional(),
  tenant_id: z.string().uuid(),
  role: z.enum([
    $Enums.roleEnum.PLATFORM_OWNER,
    $Enums.roleEnum.TENANT_ADMIN,
    $Enums.roleEnum.AGENT,
    $Enums.roleEnum.DEBTOR,
    $Enums.roleEnum.BAILIFF,
  ]),
  is_active: z.boolean().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const UserStatusSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING", "EXPIRED", "CANCELLED"]),
});

export type User = z.infer<typeof UserSchema>;
