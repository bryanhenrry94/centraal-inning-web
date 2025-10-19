"use server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import bcrypt, { hash } from "bcryptjs";
import {
  IdTokenInput,
  LoginFormData,
  loginSchema,
} from "@/lib/validations/auth";
import AuthMailService from "@/common/mail/services/authService";
import { createActivationInvoice } from "./billing-invoice";
import { $Enums } from "@/prisma/generated/prisma";
import { generateUniqueSubdomain } from "./tenant";
import { AuthSignUpSchema, ITenantSignUp } from "@/lib/validations/signup";

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
      tenantId: tenant.id,
    },
  });

  if (!user) {
    throw new Error("Invalid email or user not found in this tenant");
  }

  if (!user.passwordHash) {
    throw new Error("User has no password set");
  }

  // Verificar la contraseña
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error("Credentials are invalid");
  }

  const idToken: IdTokenInput = {
    id: user.id,
    fullname: user.fullname || "",
    email: user.email,
    phone: user.phone || "",
    tenantId: tenant.id,
    subdomain: tenant.subdomain,
    company: tenant.name,
    role: user.role || "",
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
    where: { email: email, isActive: true },
  });

  return !!user;
};

export async function createAccount(
  payload: ITenantSignUp
): Promise<{ status: boolean; subdomain: string; error?: string }> {
  try {
    // ✅ 1. Validar datos de entrada
    const validatedData = AuthSignUpSchema.parse(payload);

    // ✅ 2. Crear Tenant, User y Subscription en transacción
    const result = await prisma.$transaction(async (tx) => {
      const subdomain = await generateUniqueSubdomain(
        validatedData.company.name
      );

      const plan = await tx.plan.findFirst({
        where: { isActive: true },
      });

      if (!plan) throw new Error("No active subscription plan found");

      const planExpiresAt = new Date(
        Date.now() + plan.durationDays * 24 * 60 * 60 * 1000
      );

      const tenant = await tx.tenant.create({
        data: {
          name: validatedData.company.name,
          subdomain,
          countryCode: validatedData.company.country,
          contactEmail: validatedData.company.contactEmail,
          isActive: false,
          address: validatedData.company.address,
          numberOfEmployees: validatedData.company.numberOfEmployees,
          termsAccepted: validatedData.company.termsAccepted,

          planId: plan.id,
          planExpiresAt: planExpiresAt,
          planStatus: "active",
        },
      });

      await tx.tenantRegistry.create({
        data: {
          tenantId: tenant.id,
          kvk: validatedData.company.kvk,
        },
      });

      const passwordHash = await hash(validatedData.user.password, 10);

      const user = await tx.user.create({
        data: {
          email: validatedData.user.email,
          fullname: validatedData.user.fullname,
          passwordHash,
          phone: validatedData.user.phone,
          role: $Enums.roleEnum.ADMIN,
          tenantId: tenant.id,
          isActive: true,
        },
      });

      return { tenant, user, plan };
    });

    // ✅ 3. Crear factura de activación (fuera de la transacción)
    await createActivationInvoice({
      tenantId: result.tenant.id,
      planId: result.plan.id,
      island: validatedData.company.country,
      address: validatedData.company.address,
      amount: result.plan.price,
    });

    // ✅ 4. Enviar correo de bienvenida (no bloqueante)
    await AuthMailService.sendWelcomeEmail(
      result.user.email,
      result.user.fullname || ""
    ).catch((err) => console.error("Email error:", err));

    // ✅ 5. Revalidar caché si es necesario
    revalidatePath("/auth/signup");

    return { status: true, subdomain: result.tenant.subdomain };
  } catch (error: any) {
    console.error("Error creating account:", error);
    return { status: false, subdomain: "", error: error.message };
  }
}
