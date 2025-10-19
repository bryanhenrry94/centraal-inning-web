"use server";
import prisma from "@/lib/prisma";

export const getPlanById = async (id: string) => {
  const plan = await prisma.plan.findFirst({
    where: { id },
  });
  return plan;
};
