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
    reminder1_due_date: collection.reminder1_due_date ?? undefined,
    reminder2_due_date: collection.reminder2_due_date ?? undefined,
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
    reminder1_due_date: collection.reminder1_due_date ?? undefined,
    reminder2_due_date: collection.reminder2_due_date ?? undefined,
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

  // Obtener el tenant
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenant_id },
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
    where: { id: parsedData.debtor_id },
  });
  if (!debtor) throw new Error("Debtor not found");

  // Calcular montos
  const amount_original = parsedData.amount_original ?? 0;
  const comision = (amount_original * parameter.collection_fee_rate) / 100; // 15% de comisión
  const abb = (comision * parameter.abb_rate) / 100; // 6% de impuesto sobre la comisión
  const amount_due = comision + abb;
  const amount_to_receive = amount_original - amount_due;

  // Obtener los días de notificación según el estado de la ultima notificacion y tipo de persona
  const dayReminderOne = await getNotificationDays(
    $Enums.NotificationType.AANMANING,
    debtor.person_type
  );

  // Obtener los días de notificación según el estado de la ultima notificacion y tipo de persona
  const dayReminderTwo = await getNotificationDays(
    $Enums.NotificationType.SOMMATIE,
    debtor.person_type
  );

  // Calcular las fechas de recordatorio
  const today = new Date();
  const addDays = (date: Date, days: number) =>
    new Date(date.getTime() + Math.round(days) * 24 * 60 * 60 * 1000);
  const reminder1_due_date = addDays(today, Number(dayReminderOne) || 0);
  const reminder2_due_date = addDays(today, Number(dayReminderTwo) || 0);

  // La fecha de vencimiento se suma los dias del primer recordatorio a la fecha de hoy
  const due_date = addDays(today, Number(dayReminderOne) || 0);

  // Crear el caso de cobranza
  const newCollectionCase = await prisma.collectionCase.create({
    data: {
      debtor_id: parsedData.debtor_id || "",
      reference_number: parsedData.reference_number || "",
      issue_date: parsedData.issue_date
        ? new Date(parsedData.issue_date)
        : undefined,
      due_date: due_date,
      reminder1_due_date: reminder1_due_date,
      reminder1_sent_at: null,
      reminder2_due_date: reminder2_due_date,
      reminder2_sent_at: null,
      amount_original: amount_original,
      amount_due: amount_due,
      amount_to_receive: amount_to_receive,
      status:
        (parsedData.status as $Enums.CollectionCaseStatus) ||
        $Enums.CollectionCaseStatus.PENDING,
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

export const processCollection = async (tenant_id: string) => {
  // consulta todas las facturas del tenant y las procesa segun su estado
  const collections = await prisma.collectionCase.findMany({
    where: {
      tenant_id,
      status: { not: $Enums.CollectionCaseStatus.COMPLETED },
      amount_to_receive: { gt: 0 },
    },
    include: { debtor: true },
  });

  const today = new Date();

  // recorre las facturas y dependiendo de su estado notifica al deudor
  for (const collection of collections) {
    if (!collection.due_date) continue; // si no tiene fecha de vencimiento, no hacer nada

    if (collection.due_date < today) {
      // si la factura esta vencida y no esta pagada, se actualiza su estado a OVERDUE
      await prisma.collectionCase.update({
        where: { id: collection.id },
        data: { status: $Enums.CollectionCaseStatus.IN_PROGRESS },
      });

      // tiene notificaciones
      const recentNotifications =
        await prisma.collectionCaseNotification.findMany({
          where: {
            collection_case_id: collection.id,
            sent_at: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // ultimos 7 dias
          },
        });

      if (recentNotifications.length > 0) {
        // ya se envio una notificacion en los ultimos 7 dias, no hacer nada
        continue;
      }

      // obtiene la ultima notificacion enviada
      const lastNotification =
        await prisma.collectionCaseNotification.findFirst({
          where: {
            collection_case_id: collection.id,
          },
          orderBy: {
            sent_at: "desc",
          },
        });

      // si no hay notificaciones o la ultima es mayor a 7 dias, crear una nueva notificacion
      if (
        !lastNotification ||
        (today.getTime() - lastNotification.sent_at.getTime()) /
          (1000 * 60 * 60 * 24) >=
          7
      ) {
        if (!lastNotification) {
          // crear una nueva notificacion
          await prisma.collectionCaseNotification.create({
            data: {
              type: "AANMANING",
              title: "Primer aviso de pago",
              message: `Su factura con referencia ${collection.reference_number} ha vencido. Por favor, realice el pago lo antes posible.`,
              collection_case_id: collection.id,
              sent_at: new Date(),
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
          await prisma.collectionCaseNotification.create({
            data: {
              collection_case_id: collection.id,
              type: type_notification,
              title: `Aviso de ${type_notification}`,
              message: `Su factura con referencia ${collection.reference_number} ha vencido. Por favor, realice el pago lo antes posible.`,
              sent_at: new Date(),
            },
          });
        }
      }

      // aqui se podria enviar una notificacion al deudor
    } else {
      // si la factura no esta vencida, se mantiene en PENDING
      await prisma.collectionCase.update({
        where: { id: collection.id },
        data: { status: $Enums.CollectionCaseStatus.PENDING },
      });
      // aqui se podria enviar un recordatorio al deudor
    }
  }

  return { message: "Invoices processed successfully" };
};
