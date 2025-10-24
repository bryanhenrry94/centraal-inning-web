"use server";
import prisma from "@/lib/prisma";
import { IParamGeneral } from "@/lib/validations/parameter";

export const getParameterById = async (id: string) => {
  const parameter = await prisma.parameter.findUnique({
    where: {
      id: id,
    },
  });

  return parameter;
};

export const createParameter = async (data: IParamGeneral) => {
  const newParameter = await prisma.parameter.create({
    data: {
      ...data,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  return newParameter;
};

export const updateParameter = async (
  id: string,
  data: Partial<IParamGeneral>
) => {
  const updatedParameter = await prisma.parameter.update({
    where: {
      id: id,
    },
    data: {
      ...data,
      updated_at: new Date(),
    },
  });

  return updatedParameter;
};
