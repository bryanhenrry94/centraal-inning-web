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

type CollectionCaseFilter = {
  tenant_id: string;
  status?: $Enums.CollectionCaseStatus;
  debtor_id?: string;
};

export const getAllCollectionCases = async (
  params: CollectionCaseFilter
): Promise<CollectionCaseResponse[]> => {
  const collectionCases = await prisma.collectionCase.findMany({
    where: { ...params },
    include: {
      debtor: true,
    },
  });

  return collectionCases.map((collection) => ({
    id: collection.id,
    reference_number: collection.reference_number || "",
    issue_date: collection.issue_date,
    due_date: collection.due_date,
    tenant_id: collection.tenant_id,
    debtor_id: collection.debtor_id,
    amount_original: Number(collection.amount_original),
    fee_rate: Number(collection.fee_rate),
    fee_amount: Number(collection.fee_amount),
    abb_rate: Number(collection.abb_rate),
    abb_amount: Number(collection.abb_amount),
    total_fined: Number(collection.total_fined),
    total_due: Number(collection.total_due),
    total_to_receive: Number(collection.total_to_receive),
    total_paid: Number(collection.total_paid),
    balance: Number(collection.balance),
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
    id: collection.id,
    reference_number: collection.reference_number || "",
    issue_date: collection.issue_date,
    due_date: collection.due_date,
    tenant_id: collection.tenant_id,
    debtor_id: collection.debtor_id,
    amount_original: collection.amount_original.toNumber(),
    fee_rate: collection.fee_rate.toNumber(),
    fee_amount: collection.fee_amount.toNumber(),
    abb_rate: collection.abb_rate.toNumber(),
    abb_amount: collection.abb_amount.toNumber(),
    total_fined: collection.total_fined.toNumber(),
    total_due: collection.total_due.toNumber(),
    total_to_receive: collection.total_to_receive.toNumber(),
    total_paid: collection.total_paid.toNumber(),
    balance: collection.balance.toNumber(),
    status: collection.status as $Enums.CollectionCaseStatus,
    created_at: collection.created_at,
    updated_at: collection.updated_at,
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
    reference_number: collection.reference_number || "",
    issue_date: collection.issue_date,
    due_date: collection.due_date,
    tenant_id: collection.tenant_id,
    debtor_id: collection.debtor_id,
    amount_original: collection.amount_original.toNumber(),
    fee_rate: collection.fee_rate.toNumber(),
    fee_amount: collection.fee_amount.toNumber(),
    abb_rate: collection.abb_rate.toNumber(),
    abb_amount: collection.abb_amount.toNumber(),
    total_fined: collection.total_fined.toNumber(),
    total_due: collection.total_due.toNumber(),
    total_to_receive: collection.total_to_receive.toNumber(),
    total_paid: collection.total_paid.toNumber(),
    balance: collection.balance.toNumber(),
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

  const fee_rate = parameter.collection_fee_rate;
  const abb_rate = parameter.abb_rate;

  // Calcular montos
  const fee_amount = Number(
    ((parsedData.amount_original * fee_rate) / 100).toFixed(2)
  );
  const abb_amount = Number(((fee_amount * abb_rate) / 100).toFixed(2));

  // total con impuestos y multas
  const total_due = Number(
    (parsedData.amount_original + fee_amount + abb_amount).toFixed(2)
  );

  // neto después de retención
  const total_to_receive = Number(
    (parsedData.amount_original - fee_amount - abb_amount).toFixed(2)
  );

  const balance = parsedData.amount_original + fee_amount + abb_amount;

  // Calcular fechas de recordatorio
  const day_term = await getNotificationDays(
    parsedData.status as $Enums.CollectionCaseStatus,
    debtor.person_type
  );

  const daysToAdd =
    typeof day_term === "number" && !isNaN(day_term) ? day_term : 0;

  const due_date = new Date(
    parsedData.issue_date.getTime() + daysToAdd * 24 * 60 * 60 * 1000
  );

  // Crear el caso de cobranza
  const newCollectionCase = await prisma.collectionCase.create({
    data: {
      debtor_id: parsedData.debtor_id || "",
      reference_number: parsedData.reference_number || "",
      issue_date: parsedData.issue_date,
      due_date: due_date,
      amount_original: parsedData.amount_original,
      fee_rate: fee_rate,
      fee_amount: fee_amount,
      abb_rate: abb_rate,
      abb_amount: abb_amount,
      total_fined: 0, // total de multas
      total_due: total_due, // total con impuestos y multas
      total_to_receive: total_to_receive, // neto después de retención
      total_paid: 0,
      balance: balance,
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
    amount: fee_amount,
  });

  console.log("Portal CI - Caso de cobranza creado: ", newCollectionCase.id);
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

export const updateCollectionStatusAndSendNotification = async (
  id: string,
  status: $Enums.CollectionCaseStatus
) => {
  await prisma.collectionCase.update({
    where: {
      id: id,
    },
    data: {
      status: status,
    },
  });

  await sendNotification(id);
};
