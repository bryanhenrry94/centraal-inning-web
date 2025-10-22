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
import { getParameterById } from "./parameter";

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
              | "INDIVIDUAL"
              | "COMPANY",
          }
        : {}),
      ...(collection.debtor?.identification
        ? { identification: collection.debtor.identification }
        : {}),
    },
  }));
};

export const getAllCollectionCasesByUserId = async (
  tenantId: string,
  userId: string
): Promise<CollectionCaseResponse[]> => {
  const debtor = await prisma.debtor.findFirst({
    where: { userId: userId },
  });
  if (!debtor) throw new Error("Debtor not found");

  const collectionCases = await prisma.collectionCase.findMany({
    where: { tenantId, debtorId: debtor.id },
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
              | "INDIVIDUAL"
              | "COMPANY",
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
              | "INDIVIDUAL"
              | "COMPANY",
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
  const parsedData = CollectionCaseCreateSchema.parse(data);

  // Obtener el tenant
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { plan: true },
  });
  if (!tenant) throw new Error("Tenant not found");

  // Obtiene params de cobranza
  const PARAMETER_ID = process.env.NEXT_PUBLIC_PARAMETER_ID || "";
  const parameter = await getParameterById(PARAMETER_ID);
  if (!parameter) {
    throw new Error("No se encontró el parámetro");
  }

  // Obtener el deudor
  const debtor = await prisma.debtor.findUnique({
    where: { id: parsedData.debtorId },
  });
  if (!debtor) throw new Error("Debtor not found");

  // Calcular montos
  const amountOriginal = parsedData.amountOriginal ?? 0;
  const comision = (amountOriginal * parameter.porcCobranza) / 100; // 15% de comisión
  const abb = (comision * parameter.porcAbb) / 100; // 6% de impuesto sobre la comisión
  const amountDue = comision + abb;
  const amountToReceive = amountOriginal - amountDue;

  // Obtener los días de notificación según el estado de la ultima notificacion y tipo de persona
  const dayReminderOne = await getNotificationDays(
    $Enums.NotificationType.AANMANING,
    debtor.personType
  );

  // Obtener los días de notificación según el estado de la ultima notificacion y tipo de persona
  const dayReminderTwo = await getNotificationDays(
    $Enums.NotificationType.SOMMATIE,
    debtor.personType
  );

  // Calcular las fechas de recordatorio
  const today = new Date();
  const addDays = (date: Date, days: number) =>
    new Date(date.getTime() + Math.round(days) * 24 * 60 * 60 * 1000);
  const reminder1DueDate = addDays(today, Number(dayReminderOne) || 0);
  const reminder2DueDate = addDays(today, Number(dayReminderTwo) || 0);

  // La fecha de vencimiento se suma los dias del primer recordatorio a la fecha de hoy
  const dueDate = addDays(today, Number(dayReminderOne) || 0);

  // Crear el caso de cobranza
  const newCollectionCase = await prisma.collectionCase.create({
    data: {
      debtorId: parsedData.debtorId || "",
      referenceNumber: parsedData.referenceNumber || "",
      issueDate: parsedData.issueDate
        ? new Date(parsedData.issueDate)
        : undefined,
      dueDate: dueDate,
      reminder1DueDate: reminder1DueDate,
      reminder1SentAt: null,
      reminder2DueDate: reminder2DueDate,
      reminder2SentAt: null,
      amountOriginal: amountOriginal,
      amountDue: amountDue,
      amountToReceive: amountToReceive,
      status:
        (parsedData.status as $Enums.CollectionStatus) ||
        $Enums.CollectionStatus.PENDING,
      tenantId: tenantId,
    },
  });

  // Crear room para el chat de la colección
  await prisma.chatRoom.create({
    data: {
      tenantId: tenant.id,
      collectionCaseId: newCollectionCase.id,
      name: `${debtor.fullname} ${newCollectionCase.referenceNumber}`,
    },
  });

  const firstPlan = tenant.plan;
  if (!firstPlan)
    throw new Error("Tenant does not have an active subscription");

  // // Envia la factura de la comisión al cliente
  await createCollectionInvoice({
    tenantId: tenant.id,
    planId: firstPlan.id,
    island: tenant.countryCode,
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
