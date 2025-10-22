"use server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  PaymentAgreement,
  PaymentAgreementCreate,
} from "@/lib/validations/payment-agreement";
import { $Enums } from "@/prisma/generated/prisma";

export const getPaymentAgreementsByCollection = async (
  collectionId: string
): Promise<PaymentAgreement[]> => {
  const agreements = await prisma.paymentAgreement.findMany({
    where: { collectionCaseId: collectionId },
  });

  revalidatePath(`/dashboard/collection-cases/${collectionId}`);
  return agreements.map((agreement) => ({
    id: agreement.id,
    collectionCaseId: agreement.collectionCaseId,
    totalAmount: Number(agreement.totalAmount),
    installmentAmount: Number(agreement.installmentAmount),
    installmentsCount: agreement.installmentsCount,
    startDate: agreement.startDate,
    status: String(agreement.status),
    createdAt: agreement.createdAt ?? undefined,
    updatedAt: agreement.updatedAt ?? undefined,
    debtorId: agreement.debtorId ?? undefined,
  }));
};

export const createPaymentAgreement = async (data: PaymentAgreementCreate) => {
  const newAgreement = await prisma.paymentAgreement.create({
    data: {
      collectionCaseId: data.collectionCaseId,
      totalAmount: data.totalAmount,
      installmentAmount: data.installmentAmount,
      installmentsCount: data.installmentsCount,
      startDate: data.startDate,
      status: $Enums.PaymentAgreementStatus.PENDING,
      debtorId: data.debtorId,
    },
  });

  // recorre el numero de cuotas y crea las cuotas correspondientes
  for (let i = 0; i < data.installmentsCount; i++) {
    const installmentDate = new Date(data.startDate);
    installmentDate.setMonth(installmentDate.getMonth() + i);

    await prisma.installment.create({
      data: {
        paymentAgreementId: newAgreement.id,
        number: i + 1,
        dueDate: installmentDate,
        amount: data.installmentAmount,
        status: $Enums.InstallmentStatus.PENDING,
      },
    });
  }

  revalidatePath(`/dashboard/collection-cases/${data.collectionCaseId}`);
  return {
    id: newAgreement.id,
    collectionCaseId: newAgreement.collectionCaseId,
    totalAmount: Number(newAgreement.totalAmount),
    installmentAmount: Number(newAgreement.installmentAmount),
    installmentsCount: newAgreement.installmentsCount,
    startDate: newAgreement.startDate,
    status: String(newAgreement.status),
    createdAt: newAgreement.createdAt ?? undefined,
    updatedAt: newAgreement.updatedAt ?? undefined,
    debtorId: newAgreement.debtorId ?? undefined,
  };
};

export const deletePaymentAgreement = async (id: string) => {
  // primero elimina las cuotas asociadas al acuerdo de pago
  await prisma.installment.deleteMany({
    where: { paymentAgreementId: id },
  });

  // luego elimina el acuerdo de pago
  const agreement = await prisma.paymentAgreement.delete({
    where: { id },
  });

  revalidatePath(`/dashboard/collection-cases/${agreement.collectionCaseId}`);
  return;
};

export const updatePaymentAgreement = async (
  id: string,
  data: PaymentAgreementCreate
) => {
  const updatedAgreement = await prisma.paymentAgreement.update({
    where: { id },
    data: {
      totalAmount: data.totalAmount,
      installmentAmount: data.installmentAmount,
      installmentsCount: data.installmentsCount,
      startDate: data.startDate,
    },
  });

  revalidatePath(`/dashboard/collection-cases/${data.collectionCaseId}`);
  return {
    id: updatedAgreement.id,
    collectionCaseId: updatedAgreement.collectionCaseId,
    totalAmount: Number(updatedAgreement.totalAmount),
    installmentAmount: Number(updatedAgreement.installmentAmount),
    installmentsCount: updatedAgreement.installmentsCount,
    startDate: updatedAgreement.startDate,
    status: String(updatedAgreement.status),
    createdAt: updatedAgreement.createdAt ?? undefined,
    updatedAt: updatedAgreement.updatedAt ?? undefined,
    debtorId: updatedAgreement.debtorId ?? undefined,
  };
};

export const existsPaymentAgreement = async (
  collectionCaseId: string
): Promise<boolean> => {
  const count = await prisma.paymentAgreement.count({
    where: { collectionCaseId },
  });

  return count > 0;
};

export const getPaymentAgreementById = async (
  id: string
): Promise<PaymentAgreement | null> => {
  const agreement = await prisma.paymentAgreement.findUnique({
    where: { id },
  });

  if (!agreement) {
    return null;
  }

  return {
    id: agreement.id,
    collectionCaseId: agreement.collectionCaseId,
    totalAmount: Number(agreement.totalAmount),
    installmentAmount: Number(agreement.installmentAmount),
    installmentsCount: agreement.installmentsCount,
    startDate: agreement.startDate,
    status: String(agreement.status),
    createdAt: agreement.createdAt ?? undefined,
    updatedAt: agreement.updatedAt ?? undefined,
    debtorId: agreement.debtorId ?? undefined,
  };
};

export const countPaymentAgreementsByCollection = async (
  collectionCaseId: string
): Promise<number> => {
  const count = await prisma.paymentAgreement.count({
    where: { collectionCaseId },
  });

  return count;
};

export const getInstallmentsByAgreement = async (
  paymentAgreementId: string
) => {
  const installments = await prisma.installment.findMany({
    where: { paymentAgreementId },
  });

  return installments.map((installment) => ({
    id: installment.id,
    paymentAgreementId: installment.paymentAgreementId,
    number: installment.number,
    dueDate: installment.dueDate,
    amount: Number(installment.amount),
    status: String(installment.status),
    createdAt: installment.createdAt ?? undefined,
    updatedAt: installment.updatedAt ?? undefined,
  }));
};
