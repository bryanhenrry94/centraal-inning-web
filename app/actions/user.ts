"use server";
import prisma from "@/lib/prisma";
import { User } from "@/lib/validations/user";

export const getUserByEmail = async (email: string) => {
  const user = await prisma.user.findFirst({
    where: {
      email: email,
    },
  });

  return user;
};

export const getUsersByRole = async (roleName: string): Promise<User[]> => {
  const users = await prisma.user.findMany({
    where: {
      memberships: {
        some: {
          role: roleName as any,
        },
      },
    },
  });

  return users;
};
