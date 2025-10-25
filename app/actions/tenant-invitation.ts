"use server";
import prisma from "@/lib/prisma";

type InvitationParams = {
  tenantId: string;
  email: string;
  role: "DEBTOR" | "AGENT" | "SHERIFF";
  fullname?: string;
  debtor_id?: string;
};

export const registerInvitation = async (params: InvitationParams) => {
  const { tenantId, email, role, fullname, debtor_id } = params;

  if (!tenantId) {
    throw new Error("Tenant ID is required");
  }
  if (!email) {
    throw new Error("Email is required");
  }
  if (!role) {
    throw new Error("Role is required");
  }

  const invitation = await prisma.tenantInvitation.create({
    data: {
      tenant_id: tenantId,
      email: email,
      fullname: fullname || null,
      role: role,
      debtor_id: debtor_id || null,
      token: crypto.randomUUID(),
      created_at: new Date(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expires in 7 days
    },
  });

  return invitation;
};
