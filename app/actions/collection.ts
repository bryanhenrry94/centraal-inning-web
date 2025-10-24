"use server";
import prisma from "@/lib/prisma";
import { createCollectionInvoice } from "@/app/actions/billing-invoice";

import {
  CollectionCase,
  CollectionCaseCreate,
  CollectionCaseCreateSchema,
  CollectionCaseResponse,
  CollectionCaseSchema,
  CollectionCaseView,
} from "@/lib/validations/collection";
import { $Enums } from "@/prisma/generated/prisma";
import {
  getNotificationDays,
  sendNotification,
} from "@/app/actions/notification";
import { getParameter } from "./parameter";

export const getAllCollectionCases = async (
  tenant_id: string
): Promise<CollectionCaseResponse[]> => {
  const collectionCases = await prisma.collectionCase.findMany({
    where: { tenant_id },
    include: {
      debtor: true,
    },
  });

  return collectionCases.map((collection) => ({
    id: collection.id,
    reference_number: collection.reference_number || undefined,
    issue_date: collection.issue_date ?? undefined,
    due_date: collection.due_date ?? undefined,
    tenant_id: collection.tenant_id ?? undefined,
    debtor_id: collection.debtor_id,
    amount_original: collection.amount_original.toDecimalPlaces(2).toNumber(),
    amount_due: collection.amount_due.toDecimalPlaces(2).toNumber(),
    amount_to_receive: collection.amount_to_receive
      .toDecimalPlaces(2)
      .toNumber(),
    status: collection.status as $Enums.CollectionCaseStatus,
    created_at: collection.created_at,
    updated_at: collection.updated_at,
    debtor: {
      id: collection.debtor?.id ?? "",
      fullname: collection.debtor?.fullname ?? "",
      email: collection.debtor?.email ?? "",
      identification_type: collection.debtor
        ?.identification_type as $Enums.IdentificationType,
      ...(collection.debtor?.phone ? { phone: collection.debtor.phone } : {}),
      ...(collection.debtor?.address
        ? { address: collection.debtor.address }
        : {}),
      ...(collection.debtor?.person_type
        ? {
            person_type: collection.debtor.person_type as $Enums.PersonType,
          }
        : {}),
      ...(collection.debtor?.identification
        ? { identification: collection.debtor.identification }
        : {}),
    },
  }));
};

export const getAllCollectionCasesByUserId = async (
  tenant_id: string,
  user_id: string
): Promise<CollectionCaseResponse[]> => {
  const debtor = await prisma.debtor.findFirst({
    where: { user_id: user_id },
  });
  if (!debtor) throw new Error("Debtor not found");

  const collectionCases = await prisma.collectionCase.findMany({
    where: { tenant_id, debtor_id: debtor.id },
    include: {
      debtor: true,
    },
  });

  return collectionCases.map((collection) => ({
    id: collection.id,
    reference_number: collection.reference_number || undefined,
    issue_date: collection.issue_date ?? undefined,
    due_date: collection.due_date ?? undefined,
    tenant_id: collection.tenant_id ?? undefined,
    debtor_id: collection.debtor_id,
    amount_original: collection.amount_original.toDecimalPlaces(2).toNumber(),
    amount_due: collection.amount_due.toDecimalPlaces(2).toNumber(),
    amount_to_receive: collection.amount_to_receive
      .toDecimalPlaces(2)
      .toNumber(),
    status: collection.status as $Enums.CollectionCaseStatus,
    created_at: collection.created_at,
    updated_at: collection.updated_at,
    debtor: {
      id: collection.debtor?.id ?? "",
      fullname: collection.debtor?.fullname ?? "",
      email: collection.debtor?.email ?? "",
      identification_type: collection.debtor
        ?.identification_type as $Enums.IdentificationType,
      ...(collection.debtor?.phone ? { phone: collection.debtor.phone } : {}),
      ...(collection.debtor?.address
        ? { address: collection.debtor.address }
        : {}),
      ...(collection.debtor?.person_type
        ? {
            person_type: collection.debtor.person_type as $Enums.PersonType,
          }
        : {}),
      ...(collection.debtor?.identification
        ? { identification: collection.debtor.identification }
        : {}),
    },
  }));
};

export const getCollectionById = async (
  id: string
): Promise<CollectionCase> => {
  const collection = await prisma.collectionCase.findUnique({
    where: { id },
  });
  if (!collection) throw new Error("Collection not found");

  return {
    ...collection,
    id: collection.id,
    reference_number: collection.reference_number || undefined,
    issue_date: collection.issue_date ?? undefined,
    due_date: collection.due_date ?? undefined,
    tenant_id: collection.tenant_id ?? undefined,
    debtor_id: collection.debtor_id,
    amount_original: collection.amount_original.toDecimalPlaces(2).toNumber(),
    amount_due: collection.amount_due.toDecimalPlaces(2).toNumber(),
    amount_to_receive: collection.amount_to_receive
      .toDecimalPlaces(2)
      .toNumber(),
    status: collection.status as $Enums.CollectionCaseStatus,
    created_at: collection.created_at ?? undefined,
    updated_at: collection.updated_at ?? undefined,
  };
};

export const getCollectionViewById = async (
  id: string
): Promise<CollectionCaseView> => {
  const collection = await prisma.collectionCase.findUnique({
    where: { id },
    include: { debtor: true, payments: true },
  });
  if (!collection) throw new Error("Collection not found");

  return {
    ...collection,
    id: collection.id,
    reference_number: collection.reference_number || undefined,
    issue_date: collection.issue_date ?? undefined,
    due_date: collection.due_date ?? undefined,
    tenant_id: collection.tenant_id ?? undefined,
    debtor_id: collection.debtor_id,
    amount_original: collection.amount_original.toDecimalPlaces(2).toNumber(),
    amount_due: collection.amount_due.toDecimalPlaces(2).toNumber(),
    amount_to_receive: collection.amount_to_receive
      .toDecimalPlaces(2)
      .toNumber(),
    status: collection.status as $Enums.CollectionCaseStatus,
    created_at: collection.created_at,
    updated_at: collection.updated_at,
    payments:
      collection.payments.map((payment) => ({
        ...payment,
        amount:
          typeof payment.amount === "object" && "toNumber" in payment.amount
            ? payment.amount.toNumber()
            : Number(payment.amount),
        method: payment.method as $Enums.PaymentMethod,
        payment_date:
          payment.payment_date instanceof Date
            ? payment.payment_date.toISOString()
            : payment.payment_date,
        reference_number: payment.reference_number ?? undefined,
        created_at: payment.created_at,
      })) ?? undefined,
    debtor: {
      id: collection.debtor?.id ?? "",
      fullname: collection.debtor?.fullname ?? "",
      email: collection.debtor?.email ?? "",
      identification_type: collection.debtor
        ?.identification_type as $Enums.IdentificationType,
      ...(collection.debtor?.phone ? { phone: collection.debtor.phone } : {}),
      ...(collection.debtor?.address
        ? { address: collection.debtor.address }
        : {}),
      ...(collection.debtor?.person_type
        ? {
            person_type: collection.debtor.person_type as $Enums.PersonType,
          }
        : {}),
      ...(collection.debtor?.identification
        ? { identification: collection.debtor.identification }
        : {}),
    },
  };
};

export const createCollectionCase = async (
  data: Partial<CollectionCaseCreate>,
  tenant_id: string
) => {
  const parsedData = CollectionCaseCreateSchema.parse(data);

  if (!parsedData) {
    throw new Error("Invalid data for creating collection case");
  }

  // Obtener el tenant
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenant_id },
  });
  if (!tenant) throw new Error("Tenant not found");

  // Obtiene params de cobranza
  const parameter = await getParameter();
  if (!parameter) {
    throw new Error("No se encontró el parámetro");
  }

  // Obtener el deudor
  const debtor = await prisma.debtor.findUnique({
    where: { id: parsedData.debtor_id },
  });
  if (!debtor) throw new Error("Debtor not found");

  // Calcular montos
  const amount_original = parsedData.amount_original ?? 0;
  const comision = (amount_original * parameter.collection_fee_rate) / 100; // 15% de comisión
  const abb = (comision * parameter.abb_rate) / 100; // 6% de impuesto sobre la comisión
  const amount_due = comision + abb;
  const amount_to_receive = amount_original - amount_due;

  // Calcular fechas de recordatorio
  const day_term = getNotificationDays(
    parsedData.status as $Enums.CollectionCaseStatus,
    debtor.person_type
  );
  const issueDate = parsedData.issue_date
    ? new Date(parsedData.issue_date)
    : undefined;
  const due_date =
    issueDate instanceof Date
      ? new Date(
          issueDate.getTime() + (Number(day_term) || 0) * 24 * 60 * 60 * 1000
        )
      : undefined;

  // Crear el caso de cobranza
  const newCollectionCase = await prisma.collectionCase.create({
    data: {
      debtor_id: parsedData.debtor_id || "",
      reference_number: parsedData.reference_number || "",
      issue_date: parsedData.issue_date
        ? new Date(parsedData.issue_date)
        : undefined,
      due_date: due_date,
      amount_original: amount_original,
      amount_due: amount_due,
      amount_to_receive: amount_to_receive,
      status:
        (parsedData.status as $Enums.CollectionCaseStatus) ||
        $Enums.CollectionCaseStatus.AANMANING,
      tenant_id: tenant_id,
    },
  });

  // Crear room para el chat de la colección
  await prisma.chatRoom.create({
    data: {
      tenant_id: tenant.id,
      collection_case_id: newCollectionCase.id,
      name: `${debtor.fullname} ${newCollectionCase.reference_number}`,
    },
  });

  // // Envia la factura de la comisión al cliente
  await createCollectionInvoice({
    tenant_id: tenant.id,
    island: tenant.country_code,
    address: tenant.address,
    amount: comision,
  });

  // Envia una notificación al deudor del aviso de AANMANING
  await sendNotification(newCollectionCase.id);
  return newCollectionCase;
};

export const updateCollection = async (
  id: string,
  data: Partial<typeof CollectionCaseSchema>
) => {
  const parsedData = CollectionCaseSchema.partial().parse(data);

  // Exclude 'id' from update data
  const { id: _id, ...updateData } = parsedData;

  // Remove undefined properties to match Prisma types
  const filteredUpdateData = Object.fromEntries(
    Object.entries(updateData).filter(([_, v]) => v !== undefined)
  );
  const updatedCollection = await prisma.collectionCase.update({
    where: { id },
    data: filteredUpdateData,
  });
  return updatedCollection;
};

export const deleteCollection = async (id: string) => {
  await prisma.collectionCase.delete({
    where: { id },
  });
  return { message: "Collection deleted successfully" };
};

export const getNextCollectionStatus = async (
  currentStatus: $Enums.CollectionCaseStatus
): Promise<$Enums.CollectionCaseStatus | null> => {
  switch (currentStatus) {
    case $Enums.CollectionCaseStatus.AANMANING:
      return $Enums.CollectionCaseStatus.SOMMATIE;
    case $Enums.CollectionCaseStatus.SOMMATIE:
      return $Enums.CollectionCaseStatus.INGEBREKESTELLING;
    case $Enums.CollectionCaseStatus.INGEBREKESTELLING:
      return $Enums.CollectionCaseStatus.BLOKKADE;
    case $Enums.CollectionCaseStatus.BLOKKADE:
      return null;
    default:
      return null;
  }
};
