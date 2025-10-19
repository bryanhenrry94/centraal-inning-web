"use server";
import prisma from "@/lib/prisma";
import { Tenant } from "@/lib/validations/tenant";

export const getTenantByEmail = async (
  email: string
): Promise<{ subdomain: string; clientName: string }[]> => {
  if (!email) {
    throw new Error("Email is required");
  }

  const tenants = await prisma.tenant.findMany({
    where: {
      users: {
        some: {
          email: email,
        },
      },
      isActive: true,
    },
  });

  return tenants.map((tenant) => ({
    subdomain: tenant.subdomain,
    clientName: tenant.name,
  }));
};

export const getTenantById = async (
  id: string
): Promise<{ tenant: Tenant } | null> => {
  if (!id) {
    throw new Error("Tenant ID is required");
  }

  const tenant = await prisma.tenant.findUnique({
    where: {
      id: id,
    },
  });

  if (!tenant) {
    return null;
  }

  const tenantData: Tenant = {
    id: tenant.id,
    name: tenant.name,
    subdomain: tenant.subdomain,
    countryCode: tenant.countryCode,
    contactEmail: tenant.contactEmail,
    address: tenant.address,
    city: tenant.city,
    phone: tenant.phone,
    numberOfEmployees: tenant.numberOfEmployees,
    website: tenant.website,
    logoUrl: tenant.logoUrl,
    isActive: tenant.isActive,
    termsAccepted: tenant.termsAccepted,
    planStatus: tenant.planStatus as "pending" | "active" | "suspended",
    createdAt: tenant.createdAt,
    updatedAt: tenant.updatedAt,
  };

  return {
    tenant: tenantData,
  };
};

export const validateTenantById = async (id: string) => {
  const tenant = await getTenantById(id);
  if (!tenant) {
    throw new Error("Tenant not found");
  }
  return tenant;
};

export const getAllTenants = async (): Promise<Tenant[]> => {
  const tenants = await prisma.tenant.findMany();

  return tenants.map((tenant) => ({
    ...tenant,
    countryCode: tenant.countryCode as "BQ" | "CW" | "AW",
    planStatus: tenant.planStatus as "pending" | "active" | "suspended",
  }));
};

export const validaSubdomain = async (subdomain: string) => {
  const tenant = await prisma.tenant.findFirst({
    where: { subdomain },
  });

  return tenant ? true : false;
};

export const generateUniqueSubdomain = async (
  companyName: string
): Promise<string> => {
  let subdomain = companyName.toLowerCase().replace(/\s+/g, "-");
  let exists = await prisma.tenant.findUnique({
    where: { subdomain },
  });

  let suffix = 1;
  while (exists) {
    subdomain = `${companyName.toLowerCase().replace(/\s+/g, "-")}-${suffix}`;
    exists = await prisma.tenant.findUnique({
      where: { subdomain },
    });
    suffix++;
  }

  return subdomain;
};
