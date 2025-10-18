import { z } from "zod";

export const TenantSchema = z.object({
  id: z.string().uuid(), // Identificador único del tenant
  name: z.string(), // Nombre comercial
  subdomain: z.string(), // Subdominio de acceso
  countryCode: z.string(), // Código de país ('BQ', 'CW', 'AW')
  contactEmail: z.string().email(), // Email de contacto
  address: z.string().nullable().optional(), // Dirección
  city: z.string().nullable().optional(), // Ciudad
  phone: z.string().nullable().optional(), // Teléfono
  numberOfEmployees: z.number().int().nullable().optional(), // Número de empleados
  website: z.string().nullable().optional(), // Sitio web
  logoUrl: z.string().nullable().optional(), // URL del logo
  isActive: z.boolean().default(false), // Estado activo
  termsAccepted: z.boolean().default(false), // Términos aceptados
  planStatus: z.enum(["pending", "active", "suspended"]).default("pending"), // Estado del plan
  createdAt: z.coerce.date(), // Fecha de creación
  updatedAt: z.coerce.date(), // Fecha de última actualización
});

export const TenantCreateSchema = TenantSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const TenantUpdateSchema = TenantCreateSchema.partial().extend({
  id: z.string().uuid(),
});

export type Tenant = z.infer<typeof TenantSchema>;
export type TenantUpdate = z.infer<typeof TenantUpdateSchema>;
