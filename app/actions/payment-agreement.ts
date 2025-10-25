"use server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  PaymentAgreement,
  PaymentAgreementCreate,
  PaymentAgreementResponse,
} from "@/lib/validations/payment-agreement";
import { $Enums } from "@/prisma/generated/prisma";

type PaymentAgreementFilter = {
  collection_case_id?: string;
  tenant_id?: string;
  status?: $Enums.AgreementStatus;
  debtor_id?: string;
};

export const getPaymentAgreements = async (
  filter?: Partial<PaymentAgreementFilter>
): Promise<PaymentAgreementResponse[]> => {
  const agreements = await prisma.collectionCaseAgreement.findMany({
    where: { ...filter },
    include: {
      collection_case: true,
      debtor: true,
    },
  });

  revalidatePath("/dashboard/payment-agreements");
  return agreements.map((agreement) => ({
    id: agreement.id,
    collection_case_id: agreement.collection_case_id,
    tenant_id: agreement.tenant_id,
    total_amount: Number(agreement.total_amount),
    installment_amount: Number(agreement.installment_amount),
    installments_count: agreement.installments_count,
    start_date: agreement.start_date,
    end_date: agreement.end_date,
    status: String(agreement.status),
    created_at: agreement.created_at ?? undefined,
    updated_at: agreement.updated_at ?? undefined,
    debtor_id: agreement.debtor_id ?? undefined,
    comment: agreement.comment ?? undefined,
    collection_case: {
      id: agreement.collection_case.id,
      reference_number: agreement.collection_case.reference_number ?? "",
      issue_date: agreement.collection_case.issue_date ?? undefined,
    },
    debtor: agreement.debtor
      ? {
          id: agreement.debtor.id,
          fullname: agreement.debtor.fullname,
          email: agreement.debtor.email ?? undefined,
          phone: agreement.debtor.phone ?? undefined,
        }
      : undefined,
  }));
};

export const createPaymentAgreement = async (
  tenant_id: string,
  data: PaymentAgreementCreate
) => {
  const newAgreement = await prisma.collectionCaseAgreement.create({
    data: {
      tenant_id: tenant_id,
      collection_case_id: data.collection_case_id,
      total_amount: data.total_amount,
      installment_amount: data.installment_amount,
      installments_count: data.installments_count,
      start_date: data.start_date,
      end_date: data.end_date,
      status: $Enums.AgreementStatus.PENDING,
      debtor_id: data.debtor_id,
    },
  });

  // recorre el numero de cuotas y crea las cuotas correspondientes
  for (let i = 0; i < data.installments_count; i++) {
    const installmentDate = new Date(data.start_date);
    installmentDate.setMonth(installmentDate.getMonth() + i);

    await prisma.collectionCaseAgreementInstallment.create({
      data: {
        agreement_id: newAgreement.id,
        number: i + 1,
        due_date: installmentDate,
        amount: data.installment_amount,
        status: $Enums.InstallmentStatus.PENDING,
      },
    });
  }

  revalidatePath(`/dashboard/collection-cases/${data.collection_case_id}`);
  return {
    id: newAgreement.id,
    collection_case_id: newAgreement.collection_case_id,
    total_amount: Number(newAgreement.total_amount),
    installment_amount: Number(newAgreement.installment_amount),
    installments_count: newAgreement.installments_count,
    start_date: newAgreement.start_date,
    status: String(newAgreement.status),
    created_at: newAgreement.created_at ?? undefined,
    updated_at: newAgreement.updated_at ?? undefined,
    debtor_id: newAgreement.debtor_id ?? undefined,
  };
};

export const deletePaymentAgreement = async (id: string) => {
  // primero elimina las cuotas asociadas al acuerdo de pago
  await prisma.collectionCaseAgreementInstallment.deleteMany({
    where: { agreement_id: id },
  });

  // luego elimina el acuerdo de pago
  const agreement = await prisma.collectionCaseAgreement.delete({
    where: { id },
  });

  revalidatePath(`/dashboard/collection-cases/${agreement.collection_case_id}`);
  return;
};

export const updatePaymentAgreement = async (
  id: string,
  data: Partial<PaymentAgreement>
) => {
  // Build an update object with only the fields that Prisma allows to be updated
  const updateData: {
    total_amount?: number;
    installment_amount?: number;
    installments_count?: number;
    start_date?: Date;
    status?: $Enums.AgreementStatus;
    debtor_id?: string | null;
    comment?: string;
  } = {};

  if (data.total_amount !== undefined)
    updateData.total_amount = data.total_amount;
  if (data.installment_amount !== undefined)
    updateData.installment_amount = data.installment_amount;
  if (data.installments_count !== undefined)
    updateData.installments_count = data.installments_count;
  if (data.start_date !== undefined) updateData.start_date = data.start_date;
  if (data.status !== undefined)
    updateData.status = data.status as unknown as $Enums.AgreementStatus;
  if (data.debtor_id !== undefined)
    updateData.debtor_id = data.debtor_id ?? null;
  if (data.comment !== undefined) updateData.comment = data.comment ?? "";

  const updatedAgreement = await prisma.collectionCaseAgreement.update({
    where: { id },
    data: updateData,
  });

  if (updateData.installments_count) {
    // elimina las cuotas existentes
    await prisma.collectionCaseAgreementInstallment.deleteMany({
      where: { agreement_id: id },
    });

    // recorre el numero de cuotas y crea las cuotas correspondientes
    for (let i = 0; i < updateData.installments_count; i++) {
      const installmentDate = new Date(
        updateData.start_date || updatedAgreement.start_date
      );
      installmentDate.setMonth(installmentDate.getMonth() + i);

      await prisma.collectionCaseAgreementInstallment.create({
        data: {
          agreement_id: id,
          number: i + 1,
          due_date: installmentDate,
          amount: Number(updateData.installment_amount),
          status: $Enums.InstallmentStatus.PENDING,
        },
      });
    }
  }

  // use the updated record to revalidate the correct collection case path
  revalidatePath(
    `/dashboard/collection-cases/${updatedAgreement.collection_case_id}`
  );
  return {
    id: updatedAgreement.id,
    collection_case_id: updatedAgreement.collection_case_id,
    total_amount: Number(updatedAgreement.total_amount),
    installment_amount: Number(updatedAgreement.installment_amount),
    installments_count: updatedAgreement.installments_count,
    start_date: updatedAgreement.start_date,
    status: String(updatedAgreement.status),
    created_at: updatedAgreement.created_at ?? undefined,
    updated_at: updatedAgreement.updated_at ?? undefined,
    debtor_id: updatedAgreement.debtor_id ?? undefined,
  };
};

export const existsPaymentAgreement = async (
  collection_case_id: string
): Promise<boolean> => {
  const count = await prisma.collectionCaseAgreement.count({
    where: { collection_case_id, status: $Enums.AgreementStatus.ACCEPTED },
  });

  return count > 0;
};

export const getPaymentAgreementById = async (
  id: string
): Promise<PaymentAgreement | null> => {
  const agreement = await prisma.collectionCaseAgreement.findUnique({
    where: { id },
  });

  if (!agreement) {
    return null;
  }

  return {
    id: agreement.id,
    collection_case_id: agreement.collection_case_id,
    tenant_id: agreement.tenant_id,
    total_amount: Number(agreement.total_amount),
    installment_amount: Number(agreement.installment_amount),
    installments_count: agreement.installments_count,
    start_date: agreement.start_date,
    end_date: agreement.end_date,
    status: String(agreement.status),
    created_at: agreement.created_at ?? undefined,
    updated_at: agreement.updated_at ?? undefined,
    debtor_id: agreement.debtor_id ?? undefined,
  };
};

export const countPaymentAgreementsByCollection = async (
  collection_case_id: string
): Promise<number> => {
  const count = await prisma.collectionCaseAgreement.count({
    where: { collection_case_id },
  });

  return count;
};

export const getInstallmentsByAgreement = async (agreement_id: string) => {
  const installments = await prisma.collectionCaseAgreementInstallment.findMany(
    {
      where: { agreement_id },
    }
  );

  return installments.map((installment) => ({
    id: installment.id,
    agreement_id: installment.agreement_id,
    number: installment.number,
    due_date: installment.due_date,
    amount: Number(installment.amount),
    status: String(installment.status),
    created_at: installment.created_at ?? undefined,
    updated_at: installment.updated_at ?? undefined,
  }));
};

export const hasAgreement = async (collectionId: string): Promise<boolean> => {
  try {
    const agreement = await prisma.collectionCaseAgreement.findFirst({
      where: {
        collection_case_id: collectionId,
        status: $Enums.AgreementStatus.ACCEPTED,
      },
    });

    if (agreement) return true;
    else return false;
  } catch (e) {
    return false;
  }
};
