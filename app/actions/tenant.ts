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
      is_active: true,
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
    country_code: tenant.country_code,
    contact_email: tenant.contact_email,
    address: tenant.address,
    city: tenant.city,
    phone: tenant.phone,
    number_of_employees: tenant.number_of_employees,
    website: tenant.website,
    logo_url: tenant.logo_url,
    is_active: tenant.is_active,
    terms_accepted: tenant.terms_accepted,
    created_at: tenant.created_at,
    updated_at: tenant.updated_at,
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
    country_code: tenant.country_code as "BQ" | "CW" | "AW",
  }));
};

export const validaSubdomain = async (subdomain: string) => {
  const tenant = await prisma.tenant.findFirst({
    where: { subdomain },
  });

  return tenant ? true : false;
};

export const generateUniqueSubdomain = async (
  company_name: string
): Promise<string> => {
  // sanitize: lowercase, remove accents/diacritics, remove symbols except spaces and hyphens,
  // trim, replace spaces with single hyphen and collapse multiple hyphens
  const sanitizedBase = company_name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  // fallback base if sanitization removed everything
  const base = sanitizedBase || "tenant";
  let subdomain = base;

  let exists = await prisma.tenant.findUnique({
    where: { subdomain },
  });

  let suffix = 1;
  while (exists) {
    subdomain = `${base}-${suffix}`;
    exists = await prisma.tenant.findUnique({
      where: { subdomain },
    });
    suffix++;
  }

  return subdomain;
};
