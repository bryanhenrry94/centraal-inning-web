import { z } from "zod";

export const signUpSchema = z
  .object({
    fullname: z
      .string()
      .min(2, "Name must be at least 2 characters long")
      .regex(/^\S.*\S$/, "Name cannot start or end with a space"),
    email: z
      .string()
      .nonempty("Email is required")
      .email("Invalid email format")
      .regex(/^\S.*\S$/, "Email cannot start or end with a space"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/^\S.*\S$/, "Password cannot start or end with a space"),
    confirmPassword: z
      .string()
      .nonempty("Confirm password is required")
      .regex(/^\S.*\S$/, "Confirm password cannot start or end with a space"),
    phone: z
      .string()
      .nonempty("Phone number is required")
      .regex(/^\S.*\S$/, "Phone number cannot start or end with a space"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords must match",
  });

export const companyInfoSchema = z.object({
  name: z
    .string()
    .min(2, "Company name must be at least 2 characters long")
    .regex(
      /^[a-zA-Z0-9]+([a-zA-Z0-9- ]*[a-zA-Z0-9])?$/,
      "Company name can only contain letters, numbers, hyphens, and spaces, and cannot start or end with a space"
    ),
  contactEmail: z
    .string()
    .nonempty("Contact email is required")
    .email("Invalid email format"),
  kvk: z.string().nonempty("Kvk code is required"), // No additional validation specified for kvk
  country: z.string().nonempty("Country is required"),
  address: z.string().nonempty("Address is required"),
  numberOfEmployees: z.number().min(1, "Number of employees is required"),
});

const SubdomainSchema = z.object({
  subdomain: z.string().max(50),
});

const RefreshTokenSchema = z.object({
  refreshToken: z.string(),
});

const AuthTenantSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  subdomain: z.string(),
});

const AuthUserSchema = z.object({
  fullname: z.string(),
  email: z.string().email(),
  password: z.string(),
  phone: z.string(),
  country: z.string(),
  typeIdentification: z.string(),
  identification: z.string(),
});

const AuthUsersResponseSchema = AuthUserSchema.omit({ password: true });

const AuthCompanySchema = z.object({
  name: z.string(),
  contactEmail: z.string().email(),
  kvk: z.string(),
  address: z.string(),
  country: z.string(),
  numberOfEmployees: z.number().min(1).optional(),
  termsAccepted: z.boolean(),
});

const AuthSignUpSchema = z.object({
  user: AuthUserSchema,
  company: AuthCompanySchema,
});

// Esquema para la respuesta después de crear el Client
const AuthResponseSchema = z.object({
  accessToken: z.string(), // Token de acceso
  refreshToken: z.string(), // Token de refresco
  idToken: z.string(), // Token de identificación
});

const IdTokenSchema = z.object({
  id: z.string().uuid(),
  fullname: z.string(),
  email: z.string().email(),
  phone: z.string(),
  country: z.string(),
  typeIdentification: z.string(),
  identification: z.string(),
  tenantId: z.string(),
  subdomain: z.string(),
  company: z.string(),
  role: z.string(),
  emailVerified: z.boolean(),
});

const EmailVerifySchema = z.object({
  email: z.string().email(),
});

const EmailTokenVerificationSchema = z.object({
  token: z.string(),
});

const MagicLoginSchema = z.object({
  token: z.string(),
});

const ResendVerificationEmailSchema = z.object({
  userId: z.string(),
});

const EmailVerificationResponseSchema = z.object({
  sub: z.string().uuid(),
  fullname: z.string(),
  email: z.string().email(),
  phone: z.string(),
  country: z.string(),
  typeIdentification: z.string(),
  identification: z.string(),
  tenantId: z.string(),
  subdomain: z.string(),
  role: z.string(),
  emailVerified: z.boolean(),
});

export {
  AuthUserSchema,
  AuthCompanySchema,
  AuthSignUpSchema,
  AuthUsersResponseSchema,
  AuthResponseSchema,
  SubdomainSchema,
  RefreshTokenSchema,
  AuthTenantSchema,
  IdTokenSchema,
  EmailTokenVerificationSchema,
  ResendVerificationEmailSchema,
  EmailVerificationResponseSchema,
  EmailVerifySchema,
  MagicLoginSchema,
};

export type FormData = z.infer<typeof EmailVerifySchema>;
// Tipos inferidos
export type iAuthUser = z.infer<typeof AuthUserSchema>;
export type iAuthUserResponse = z.infer<typeof AuthUsersResponseSchema>;
export type iAuthCompany = z.infer<typeof AuthCompanySchema>;
export type iAuthTenantSignUp = z.infer<typeof AuthSignUpSchema>;
export type iAuthResponse = z.infer<typeof AuthResponseSchema>;
export type iSubdomain = z.infer<typeof SubdomainSchema>;
export type iRefreshToken = z.infer<typeof RefreshTokenSchema>;
export type iSignInTenant = z.infer<typeof AuthTenantSchema>;
export type iIdToken = z.infer<typeof IdTokenSchema>;
export type iEmailTokenVerification = z.infer<
  typeof EmailTokenVerificationSchema
>;
export type iResendVerificationEmail = z.infer<
  typeof ResendVerificationEmailSchema
>;
export type iEmailVerificationResponse = z.infer<
  typeof EmailVerificationResponseSchema
>;
export type iMagicLogin = z.infer<typeof MagicLoginSchema>;

export interface IUserToken {
  email: string;
  tenantId: string;
  subdomain: string;
  role: string;
  id: string;
}

export interface IuserTokenInfos {
  exp: number;
  email: string;
  role: string;
  tenantId: string;
  subdomain: string;
  type: string;
  sub: string;
}

export interface IAccountUrl {
  subdomain: string;
  link: string;
  company: string;
}

export interface IcompanyTokenInfos {
  invitedEmail: string;
  invitedCompany: string;
  country: string;
  type: string;
}

export interface IUser {
  fullname: string;
  email: string;
  password: string;
  phone: string;
  country: string;
  typeIdentification: string;
  identification: string;
}

export interface ICompany {
  name: string;
  contactEmail: string;
  kvk: string;
  address: string;
  country: string;
  numberOfEmployees: number;
  termsAccepted: boolean;
}

export interface ITenantSignUp {
  user: IUser;
  company: ICompany;
}

export const initialTenantSignUp: ITenantSignUp = {
  user: {
    fullname: "",
    email: "",
    password: "",
    phone: "",
    country: "",
    typeIdentification: "",
    identification: "",
  },
  company: {
    name: "",
    contactEmail: "",
    kvk: "",
    address: "",
    country: "",
    numberOfEmployees: 1,
    termsAccepted: false,
  },
};

export interface IAuthSignUpResponse {
  id: string;
  name: string;
  contactEmail: string;
  kvk: string;
  address: string;
  country: string;
  type: string;
  numberOfEmployees: "1-5" | "10-20" | "20-30" | "40-50" | "50-100" | "100+";
  termsAccepted: boolean;
  createdAt: string;
  updatedAt: string;
  tenant: {
    id: string;
    subdomain: string;
    clientId: string;
    createdAt: string;
    updatedAt: string;
  };
  user: {
    id: string;
    email: string;
    fullname: string;
    tenantId: string;
    country: string;
    phone: string;
    identification: string;
    typeIdentification: string;
    createdAt: string;
    updatedAt: string;
    role: string;
    roleId: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface iValidateSlugResponse {
  subdomain: string;
  isValid: boolean;
}

export type iAccountUrls = IAccountUrl[];
