import { IdTokenInput, LoginFormData } from "@/lib/validations/auth";
import { signInWithPassword } from "@/app/actions/auth";
import { type AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Extend NextAuth types to include custom properties
declare module "next-auth" {
  interface User extends IdTokenInput {
    name?: string;
    phone?: string;
    tenantId: string;
    role: string;
    emailVerified?: boolean;
  }
  interface Session {
    user?: User;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        subdomain: { label: "Subdomain", type: "text" },
      },
      async authorize(credentials, req) {
        const params: LoginFormData = {
          email: credentials?.email as string,
          password: credentials?.password as string,
          subdomain: credentials?.subdomain as string,
        };

        try {
          // llama logica para validar las credenciales
          const response = await signInWithPassword(params);
          console.log("Datos signInWithPassword:", response);

          // Si la autenticación es exitosa, devuelve el usuario
          if (response && response.success === true) {
            if (!response.data) {
              return null;
            }

            console.log("Usuario autorizado:", response.data);

            // Ensure all expected properties exist, even if undefined
            return {
              ...response.data,
              role: response.data.role ?? "",
              tenantId: response.data.tenantId ?? "",
              name: response.data.fullname ?? "",
              emailVerified: response.data.emailVerified ?? false,
            };
          } else {
            return null;
          }
        } catch (error) {
          console.error("Error en authorize:", error);
          return null;
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET, // 👈 obligatorio
  session: {
    strategy: "jwt", // ✅ ahora sí es válido
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.subdomain = user.subdomain;
        token.role = user.role;
        token.id = user.id;
        token.name = user.name;
        token.phone = user.phone;
        token.tenantId = user.tenantId;
        token.emailVerified = user.emailVerified;
        // Agrega aquí cualquier otra propiedad de iIdToken si es necesario
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.subdomain = token.subdomain as string;
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.phone = token.phone as string;
        session.user.tenantId = token.tenantId as string;
        session.user.emailVerified = token.emailVerified as boolean;
        // Agrega aquí cualquier otra propiedad si es necesario
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
    // signOut: "/",
  },
};
