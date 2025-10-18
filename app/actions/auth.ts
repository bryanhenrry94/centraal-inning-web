"use server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import {
  IdTokenInput,
  LoginFormData,
  loginSchema,
} from "@/lib/validations/auth";

export const signInWithPassword = async (
  params: LoginFormData
): Promise<{ success: boolean; data?: IdTokenInput }> => {
  // Validar los datos de entrada
  const validated = loginSchema.parse(params);

  console.log("Datos validados:", validated);

  if (!validated) {
    throw new Error("Invalid input data");
  }

  const { email, password, subdomain } = validated;

  if (!email || !password || !subdomain) {
    throw new Error("Email, password, and subdomain are required");
  }

  // Buscar el tenant por subdominio
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain },
  });

  if (!tenant) {
    throw new Error("Invalid subdomain");
  }

  // Buscar el usuario por email y tenantId
  const user = await prisma.user.findFirst({
    where: {
      email,
      isActive: true,
      memberships: {
        some: {
          tenantId: tenant.id,
        },
      },
    },
    include: {
      memberships: true,
    },
  });

  if (!user) {
    throw new Error("Invalid email or user not found in this tenant");
  }

  if (!user.passwordHash) {
    throw new Error("User has no password set");
  }
  // Construir el token de usuario
  const membership =
    user.memberships && user.memberships.length > 0
      ? user.memberships[0]
      : null;

  // Verificar la contraseña
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error("Credentials are invalid");
  }

  const roleName = membership && membership.role ? membership.role : null;

  const idToken: IdTokenInput = {
    id: user.id,
    fullname: user.fullname || "",
    email: user.email,
    phone: user.phone || "",
    tenantId: tenant.id,
    subdomain: tenant.subdomain,
    company: tenant.name,
    role: roleName || "",
    emailVerified: user.isActive || false,
  };

  revalidatePath("/auth/login");
  return { success: true, data: idToken };
};

export const emailExists = async (email: string): Promise<boolean> => {
  if (!email) {
    throw new Error("Email is required");
  }

  const user = await prisma.user.findFirst({
    where: { email: email },
  });

  return !!user;
};
