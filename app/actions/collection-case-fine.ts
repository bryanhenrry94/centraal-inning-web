"use server";
import prisma from "@/lib/prisma";

export const applyCollectionCaseFine = async (
  collection_case_id: string,
  amount: number,
  description: string
) => {
  const fine = await prisma.collectionCaseFine.create({
    data: {
      collection_case_id,
      amount,
      description,
      applied_at: new Date(),
    },
  });

  return fine;
};

export const getFinesForCollectionCase = async (collection_case_id: string) => {
  const fines = await prisma.collectionCaseFine.findMany({
    where: { collection_case_id },
    orderBy: { applied_at: "desc" },
  });

  return fines;
};

export const getCollectionCaseFineById = async (fine_id: string) => {
  const fine = await prisma.collectionCaseFine.findUnique({
    where: { id: fine_id },
  });

  return fine;
};
export const deleteCollectionCaseFine = async (fine_id: string) => {
  await prisma.collectionCaseFine.delete({
    where: { id: fine_id },
  });
};
export const countFinesForCollectionCase = async (
  collection_case_id: string
) => {
  const count = await prisma.collectionCaseFine.count({
    where: { collection_case_id },
  });

  return count;
};
