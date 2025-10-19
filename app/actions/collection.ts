"use server";
import prisma from "@/lib/prisma";
import { createCollectionInvoice } from "@/app/actions/billing-invoice";

import {
  CollectionCase,
  CollectionCaseCreate,
  CollectionCaseResponse,
  CollectionCaseSchema,
  CollectionCaseView,
} from "@/lib/validations/collection";
import { $Enums } from "@/prisma/generated/prisma";
import { sendNotification } from "@/app/actions/notification";

export const getAllCollectionCases = async (
  tenantId: string
): Promise<CollectionCaseResponse[]> => {
  const collectionCases = await prisma.collectionCase.findMany({
    where: { tenantId },
    include: {
      debtor: true,
    },
  });

  return collectionCases.map((collection) => ({
    id: collection.id,
    referenceNumber: collection.referenceNumber || undefined,
    issueDate: collection.issueDate ?? undefined,
    dueDate: collection.dueDate ?? undefined,
    tenantId: collection.tenantId ?? undefined,
    debtorId: collection.debtorId,
    amountOriginal: collection.amountOriginal.toDecimalPlaces(2).toNumber(),
    amountDue: collection.amountDue.toDecimalPlaces(2).toNumber(),
    amountToReceive: collection.amountToReceive.toDecimalPlaces(2).toNumber(),
    status: collection.status as
      | "PENDING"
      | "IN_PROGRESS"
      | "PAID"
      | "OVERDUE"
      | "CANCELLED",
    createdAt: collection.createdAt,
    updatedAt: collection.updatedAt,
    debtor: {
      id: collection.debtor?.id ?? "",
      fullname: collection.debtor?.fullname ?? "",
      email: collection.debtor?.email ?? "",
      identificationType: collection.debtor?.identificationType as
        | "DNI"
        | "PASSPORT"
        | "NIE"
        | "CIF"
        | "KVK"
        | "OTHER",
      ...(collection.debtor?.phone ? { phone: collection.debtor.phone } : {}),
      ...(collection.debtor?.address
        ? { address: collection.debtor.address }
        : {}),
      ...(collection.debtor?.personType
        ? {
            personType: collection.debtor.personType as
              | "individual"
              | "company",
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
    referenceNumber: collection.referenceNumber || undefined,
    issueDate: collection.issueDate ?? undefined,
    dueDate: collection.dueDate ?? undefined,
    tenantId: collection.tenantId ?? undefined,
    debtorId: collection.debtorId,
    amountOriginal: collection.amountOriginal.toDecimalPlaces(2).toNumber(),
    amountDue: collection.amountDue.toDecimalPlaces(2).toNumber(),
    amountToReceive: collection.amountToReceive.toDecimalPlaces(2).toNumber(),
    status: collection.status as
      | "PENDING"
      | "IN_PROGRESS"
      | "PAID"
      | "OVERDUE"
      | "CANCELLED",
    createdAt: collection.createdAt,
    updatedAt: collection.updatedAt,
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
    referenceNumber: collection.referenceNumber || undefined,
    issueDate: collection.issueDate ?? undefined,
    dueDate: collection.dueDate ?? undefined,
    tenantId: collection.tenantId ?? undefined,
    debtorId: collection.debtorId,
    amountOriginal: collection.amountOriginal.toDecimalPlaces(2).toNumber(),
    amountDue: collection.amountDue.toDecimalPlaces(2).toNumber(),
    amountToReceive: collection.amountToReceive.toDecimalPlaces(2).toNumber(),
    status: collection.status as
      | "PENDING"
      | "IN_PROGRESS"
      | "PAID"
      | "OVERDUE"
      | "CANCELLED",
    createdAt: collection.createdAt,
    updatedAt: collection.updatedAt,
    payments:
      collection.payments.map((payment) => ({
        ...payment,
        amount:
          typeof payment.amount === "object" && "toNumber" in payment.amount
            ? payment.amount.toNumber()
            : Number(payment.amount),
        method: payment.method as
          | "CASH"
          | "TRANSFER"
          | "CREDIT_CARD"
          | "CHECK"
          | "OTHER",
        paymentDate:
          payment.paymentDate instanceof Date
            ? payment.paymentDate.toISOString()
            : payment.paymentDate,
        referenceNumber: payment.referenceNumber ?? undefined,
        createdAt: payment.createdAt,
      })) ?? undefined,
    debtor: {
      id: collection.debtor?.id ?? "",
      fullname: collection.debtor?.fullname ?? "",
      email: collection.debtor?.email ?? "",
      identificationType: collection.debtor?.identificationType as
        | "DNI"
        | "PASSPORT"
        | "NIE"
        | "CIF"
        | "KVK"
        | "OTHER",
      ...(collection.debtor?.phone ? { phone: collection.debtor.phone } : {}),
      ...(collection.debtor?.address
        ? { address: collection.debtor.address }
        : {}),
      ...(collection.debtor?.personType
        ? {
            personType: collection.debtor.personType as
              | "individual"
              | "company",
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
  tenantId: string
) => {
  const amountOriginal = data.amountOriginal ?? 0;
  const comision = amountOriginal * 0.15; // 15% de comisión
  const abb = comision * 0.06; // 2.5% de gastos administrativos
  const amountDue = comision + abb;
  const amountToReceive = amountOriginal - amountDue;

  const newCollectionCase = await prisma.collectionCase.create({
    data: {
      debtorId: data.debtorId || "",
      referenceNumber: data.referenceNumber || "",
      issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      amountOriginal: amountOriginal,
      amountDue: amountDue,
      amountToReceive: amountToReceive,
      status:
        (data.status as $Enums.CollectionStatus) ||
        $Enums.CollectionStatus.PENDING,
      tenantId: tenantId,
    },
  });

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { plan: true },
  });
  if (!tenant) throw new Error("Tenant not found");

  const firstPlan = tenant.plan;

  if (!firstPlan)
    throw new Error("Tenant does not have an active subscription");

  // Envia la factura de la comisión al cliente
  await createCollectionInvoice({
    tenantId: tenant.id,
    planId: firstPlan.id,
    island: tenant.countryCode,
    address: tenant.address,
    amount: comision,
  });

  // Envia una notificación al deudor del aviso de AANMANING
  await sendNotification(tenant.id, newCollectionCase.id);

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

export const processCollection = async (tenantId: string) => {
  // consulta todas las facturas del tenant y las procesa segun su estado
  const collections = await prisma.collectionCase.findMany({
    where: {
      tenantId,
      status: { not: $Enums.CollectionStatus.PAID },
      amountToReceive: { gt: 0 },
    },
    include: { debtor: true },
  });

  const today = new Date();

  // recorre las facturas y dependiendo de su estado notifica al deudor
  for (const collection of collections) {
    if (!collection.dueDate) continue; // si no tiene fecha de vencimiento, no hacer nada

    if (collection.dueDate < today) {
      // si la factura esta vencida y no esta pagada, se actualiza su estado a OVERDUE
      await prisma.collectionCase.update({
        where: { id: collection.id },
        data: { status: $Enums.CollectionStatus.OVERDUE },
      });

      // tiene notificaciones
      const recentNotifications = await prisma.notification.findMany({
        where: {
          collectionCaseId: collection.id,
          sentAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // ultimos 7 dias
        },
      });

      if (recentNotifications.length > 0) {
        // ya se envio una notificacion en los ultimos 7 dias, no hacer nada
        continue;
      }

      // obtiene la ultima notificacion enviada
      const lastNotification = await prisma.notification.findFirst({
        where: {
          collectionCaseId: collection.id,
        },
        orderBy: {
          sentAt: "desc",
        },
      });

      // si no hay notificaciones o la ultima es mayor a 7 dias, crear una nueva notificacion
      if (
        !lastNotification ||
        (today.getTime() - lastNotification.sentAt.getTime()) /
          (1000 * 60 * 60 * 24) >=
          7
      ) {
        if (!lastNotification) {
          // crear una nueva notificacion
          await prisma.notification.create({
            data: {
              type: "AANMANING",
              title: "Primer aviso de pago",
              message: `Su factura con referencia ${collection.referenceNumber} ha vencido. Por favor, realice el pago lo antes posible.`,
              collectionCaseId: collection.id,
              sentAt: new Date(),
            },
          });
        } else {
          let type_notification: $Enums.NotificationType =
            $Enums.NotificationType.AANMANING;

          switch (lastNotification.type) {
            case "AANMANING":
              type_notification = $Enums.NotificationType.SOMMATIE;
              break;
            case "SOMMATIE":
              type_notification = $Enums.NotificationType.INGEBREKESTELLING;
              break;
            case "INGEBREKESTELLING":
              type_notification = $Enums.NotificationType.BLOKKADE;
              break;
            case "BLOKKADE":
              // ya se envio la ultima notificacion, no hacer nada
              break;
            default:
              break;
          }

          // crear una nueva notificacion de tipo siguiente
          await prisma.notification.create({
            data: {
              collectionCaseId: collection.id,
              type: type_notification,
              title: `Aviso de ${type_notification}`,
              message: `Su factura con referencia ${collection.referenceNumber} ha vencido. Por favor, realice el pago lo antes posible.`,
              sentAt: new Date(),
            },
          });
        }
      }

      // aqui se podria enviar una notificacion al deudor
    } else {
      // si la factura no esta vencida, se mantiene en PENDING
      await prisma.collectionCase.update({
        where: { id: collection.id },
        data: { status: $Enums.CollectionStatus.PENDING },
      });
      // aqui se podria enviar un recordatorio al deudor
    }
  }

  return { message: "Invoices processed successfully" };
};
