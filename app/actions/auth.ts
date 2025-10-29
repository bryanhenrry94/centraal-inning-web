"use server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import bcrypt, { hash } from "bcryptjs";
import {
  IdTokenInput,
  LoginFormData,
  loginSchema,
} from "@/lib/validations/auth";
import { createActivationInvoice } from "./billing-invoice";
import { $Enums } from "@/prisma/generated/prisma";
import { generateUniqueSubdomain } from "./tenant";
import { AuthSignUpSchema, ITenantSignUp } from "@/lib/validations/signup";
import { getParameter } from "./parameter";
import { CountryList } from "@/constants/country";
import { sendWelcomeEmail } from "./email";

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

  // Buscar el usuario por email y tenant_id
  const user = await prisma.user.findFirst({
    where: {
      email,
      is_active: true,
      tenant_id: tenant.id,
    },
  });

  if (!user) {
    throw new Error("Invalid email or user not found in this tenant");
  }

  if (!user.password_hash) {
    throw new Error("User has no password set");
  }

  // Verificar la contraseña
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new Error("Credentials are invalid");
  }

  const idToken: IdTokenInput = {
    id: user.id,
    fullname: user.fullname || "",
    email: user.email,
    phone: user.phone || "",
    tenant_id: tenant.id,
    subdomain: tenant.subdomain,
    company: tenant.name,
    role: user.role || "",
    email_verified: user.is_active || false,
  };

  revalidatePath("/auth/login");
  return { success: true, data: idToken };
};

export const emailExists = async (email: string): Promise<boolean> => {
  if (!email) {
    throw new Error("Email is required");
  }

  const user = await prisma.user.findFirst({
    where: { email: email, is_active: true },
  });

  return !!user;
};

export async function createAccount(
  payload: ITenantSignUp
): Promise<{ status: boolean; subdomain: string; error?: string }> {
  try {
    // ✅ 1. Validar datos de entrada
    const validatedData = AuthSignUpSchema.parse(payload);

    // Obtener parámetro necesario
    const parameter = await getParameter();
    if (!parameter) {
      throw new Error("No se encontró el parámetro");
    }

    // ✅ 2. Crear Tenant, User y Subscription en transacción
    const result = await prisma.$transaction(async (tx) => {
      const subdomain = await generateUniqueSubdomain(
        validatedData.company.name
      );

      const code = await generateCode(validatedData.company.country);

      const tenant = await tx.tenant.create({
        data: {
          name: validatedData.company.name,
          code: code,
          subdomain,
          kvk: validatedData.company.kvk,
          legal_name: validatedData.company.name,
          country_code: validatedData.company.country,
          contact_email: validatedData.company.contact_email,
          is_active: true,
          address: validatedData.company.address,
          number_of_employees: validatedData.company.number_of_employees,
          terms_accepted: validatedData.company.terms_accepted,
        },
      });

      const password_hash = await hash(validatedData.user.password, 10);

      const user = await tx.user.create({
        data: {
          email: validatedData.user.email,
          fullname: validatedData.user.fullname,
          password_hash,
          phone: validatedData.user.phone,
          role: $Enums.roleEnum.TENANT_ADMIN,
          tenant_id: tenant.id,
          is_active: true,
        },
      });

      return { tenant, user };
    });

    let pricePlan = 0;

    if (
      payload.company.number_of_employees &&
      payload.company.number_of_employees > 50
    ) {
      pricePlan = parameter.large_company_price;
    } else {
      pricePlan = parameter.small_company_price;
    }

    // ✅ 3. Crear factura de activación (fuera de la transacción)
    await createActivationInvoice({
      tenant_id: result.tenant.id,
      island: validatedData.company.country,
      address: validatedData.company.address,
      amount: pricePlan,
    });

    await sendWelcomeEmail(result.user.email, result.user.fullname || "");

    // ✅ 5. Revalidar caché si es necesario
    revalidatePath("/auth/signup");

    return { status: true, subdomain: result.tenant.subdomain };
  } catch (error: any) {
    console.error("Error creating account:", error);
    return { status: false, subdomain: "", error: error.message };
  }
}

const generateCode = async (country_code: string): Promise<string> => {
  const island = CountryList.find((c) => c.value === country_code);
  const prefix = island?.label.toUpperCase().slice(0, 3) || "XXX";
  const last_sequence = await prisma.tenant.count({
    where: {
      country_code,
    },
  });

  const new_sequence = last_sequence + 1;
  return `CI${prefix}${new_sequence.toString().padStart(3, "0")}`;
};
