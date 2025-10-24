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
    confirm_password: z
      .string()
      .nonempty("Confirm password is required")
      .regex(/^\S.*\S$/, "Confirm password cannot start or end with a space"),
    phone: z
      .string()
      .nonempty("Phone number is required")
      .regex(/^\S.*\S$/, "Phone number cannot start or end with a space"),
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ["confirm_password"],
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
  contact_email: z
    .string()
    .nonempty("Contact email is required")
    .email("Invalid email format"),
  kvk: z.string().nonempty("Kvk code is required"), // No additional validation specified for kvk
  country: z.string().nonempty("Country is required"),
  address: z.string().nonempty("Address is required"),
  number_of_employees: z.number().min(1, "Number of employees is required"),
});

const SubdomainSchema = z.object({
  subdomain: z.string().max(50),
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
  identification_type: z.string(),
  identification: z.string(),
});

const AuthUsersResponseSchema = AuthUserSchema.omit({ password: true });

const AuthCompanySchema = z.object({
  name: z.string(),
  contact_email: z.string().email(),
  kvk: z.string(),
  address: z.string(),
  country: z.string(),
  number_of_employees: z.number().min(1).optional(),
  terms_accepted: z.boolean(),
});

const AuthSignUpSchema = z.object({
  user: AuthUserSchema,
  company: AuthCompanySchema,
});

const IdTokenSchema = z.object({
  id: z.string().uuid(),
  fullname: z.string(),
  email: z.string().email(),
  phone: z.string(),
  country: z.string(),
  identification_type: z.string(),
  identification: z.string(),
  tenant_id: z.string(),
  subdomain: z.string(),
  company: z.string(),
  role: z.string(),
  email_verified: z.boolean(),
});

const ResendVerificationEmailSchema = z.object({
  user_id: z.string(),
});

const EmailVerificationResponseSchema = z.object({
  sub: z.string().uuid(),
  fullname: z.string(),
  email: z.string().email(),
  phone: z.string(),
  country: z.string(),
  identification_type: z.string(),
  identification: z.string(),
  tenant_id: z.string(),
  subdomain: z.string(),
  role: z.string(),
  email_verified: z.boolean(),
});

export {
  AuthUserSchema,
  AuthCompanySchema,
  AuthSignUpSchema,
  AuthUsersResponseSchema,
  SubdomainSchema,
  AuthTenantSchema,
  IdTokenSchema,
  ResendVerificationEmailSchema,
  EmailVerificationResponseSchema,
};

export type iAuthUser = z.infer<typeof AuthUserSchema>;
export type iAuthUserResponse = z.infer<typeof AuthUsersResponseSchema>;
export type iAuthCompany = z.infer<typeof AuthCompanySchema>;
export type iAuthTenantSignUp = z.infer<typeof AuthSignUpSchema>;
export type iSubdomain = z.infer<typeof SubdomainSchema>;
export type iSignInTenant = z.infer<typeof AuthTenantSchema>;
export type iIdToken = z.infer<typeof IdTokenSchema>;
export type iResendVerificationEmail = z.infer<
  typeof ResendVerificationEmailSchema
>;
export type iEmailVerificationResponse = z.infer<
  typeof EmailVerificationResponseSchema
>;
export interface IUserToken {
  email: string;
  tenant_id: string;
  subdomain: string;
  role: string;
  id: string;
}

export interface IuserTokenInfos {
  exp: number;
  email: string;
  role: string;
  tenant_id: string;
  subdomain: string;
  type: string;
  sub: string;
}

export interface IUser {
  fullname: string;
  email: string;
  password: string;
  phone: string;
  country: string;
  identification_type: string;
  identification: string;
}

export interface ICompany {
  name: string;
  contact_email: string;
  kvk: string;
  address: string;
  country: string;
  number_of_employees: number;
  terms_accepted: boolean;
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
    identification_type: "",
    identification: "",
  },
  company: {
    name: "",
    contact_email: "",
    kvk: "",
    address: "",
    country: "",
    number_of_employees: 1,
    terms_accepted: false,
  },
};

export interface iValidateSlugResponse {
  subdomain: string;
  is_valid: boolean;
}

export const DebtorSignUpSchema = z.object({
  reference_number: z.string(),
  email: z.string().email(),
  fullname: z.string().min(2),
  password: z.string().min(8),
});

export type DebtorSignUp = z.infer<typeof DebtorSignUpSchema>;
