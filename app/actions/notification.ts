"use server";
import prisma from "@/lib/prisma";
import { CollectionCase } from "@/lib/validations/collection";
import { getCollectionById } from "@/app/actions/collection-case";
import { Notification } from "@/lib/validations/notification";
import { getParameter } from "@/app/actions/parameter";
import { NotificationType } from "@/lib/validations/notification";

import {
  formatCurrency,
  formatDate,
  getNameCountry,
} from "@/common/utils/general";
import { $Enums } from "@/prisma/generated/prisma";
import { registerInvitation } from "./tenant-invitation";
import { protocol, rootDomain } from "@/lib/utils";
// import { htmlToPdfBuffer, loadHtmlTemplate } from "@/lib/generatePdf";
import {
  sendAanmaningEmail,
  sendBlokkadeMail,
  sendIngebrekestellingMail,
  sendSommatieEmail,
} from "./email";

export const sendNotification = async (caseId: string) => {
  if (!caseId) {
    throw new Error("Notification caseId is required");
  }

  // Check if the notification.collectionCase exists
  const collection = await getCollectionById(caseId);
  if (!collection) {
    throw new Error("Collection not found");
  }

  // Get the last notification for the collection case
  const notification = await getLastNotificationByCollectionCase(caseId);

  const notificationType = notification ? notification.type : "";

  switch (notificationType) {
    case "AANMANING":
      return await sendSommatie(collection);
    case "SOMMATIE":
      return await sendIngebrekestelling(collection);
    case "INGEBREKESTELLING":
      // if (collection.debtor_id) {
      //   const contribution: ICreateDebtorContribution = {
      //     debtor_id: collection.debtor_id,
      //     isPublic: false,
      //     notes: null,
      //   };

      //   await createContribution(tenant_id, contribution);
      // }

      return await sendBlokkade(collection);
    case "BLOKKADE":
      throw new Error("No further notifications can be sent");
    default:
      return await sendAanmaning(collection);
  }
};

export const createNotification = async (
  caseId: string,
  type: NotificationType,
  title: string,
  message: string
): Promise<Notification> => {
  if (!caseId) {
    throw new Error("Notification caseId is required");
  }

  const notification = await prisma.collectionCaseNotification.create({
    data: {
      collection_case_id: caseId,
      type,
      sent_at: new Date(),
      title,
      message,
    },
  });

  if (!notification) {
    throw new Error("Notification not found");
  }

  return {
    ...notification,
    type: notification.type as Notification["type"],
  };
};

export const sendAanmaning = async (
  collection: CollectionCase
): Promise<string> => {
  try {
    // valida el tenant
    if (!collection.tenant_id) {
      throw new Error("Tenant ID not found");
    }

    // Obtiene params de cobranza
    const parameter = await getParameter();
    if (!parameter) {
      throw new Error("No se encontró el parámetro");
    }

    // Obtiene datos del deudor
    const debtor = await prisma.debtor.findUnique({
      where: { id: collection.debtor_id },
    });
    if (!debtor) {
      throw new Error("No se encontró el deudor");
    }

    // Si el deudor no tiene email, no envía la notificación
    if (!debtor.email) {
      throw new Error("El deudor no tiene email");
    }

    // Si el deudor no tiene usuario, enviar invitación para registrarse
    let invitationLink: string = `${protocol}://${rootDomain}/`;

    console.log("Send_Aanmaning: ", debtor);

    // Verifica si el deudor ya tiene usuario
    if (debtor.user_id === null) {
      console.log("Send_Aanmaning: Sending invitation link to debtor");
      // Registrar invitación
      const invitation = await registerInvitation({
        tenantId: debtor.tenant_id,
        email: debtor.email,
        role: "DEBTOR",
        fullname: debtor.fullname,
        debtor_id: debtor.id,
      });

      if (invitation.status === true && invitation.token) {
        invitationLink = `${protocol}://${rootDomain}/invitation/${invitation.token}`;
      }
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: collection.tenant_id },
    });
    if (!tenant) {
      throw new Error("No se encontró el tenant");
    }

    // Porcentajes de cobranza y abb
    const collectionPercentage = parameter.collection_fee_rate || 15;
    const abbPercentage = parameter.abb_rate || 6;

    // Calculate additional fees
    const calculatedCollection = parseFloat(
      ((collection.amount_original * collectionPercentage) / 100).toFixed(2)
    );
    // Calculate ABB
    const calculatedABB = parseFloat(
      ((calculatedCollection * abbPercentage) / 100).toFixed(2)
    );

    const fine = 0; // This should be calculated based on the collection and the days overdue

    const subtotaal =
      collection.amount_original + calculatedCollection + calculatedABB + fine;

    // Interest 5% of total amount
    const interestAmount = parseFloat(((subtotaal * 5) / 100).toFixed(2));

    // Total Amount
    const total_amount = parseFloat((subtotaal + interestAmount).toFixed(2));

    const debtorEmail = debtor?.email;
    const subject = `Aanmaning - ${collection.reference_number}`;

    const island = getNameCountry(tenant?.country_code);

    // Data for PDF generation
    const dataReport = {
      date: formatDate(new Date().toString()),
      debtorName: debtor?.fullname || "",
      debtorAddress: debtor?.address || "",
      island: island,
      reference_number: collection.reference_number,
      bankName: parameter.bank_name,
      accountNumber: parameter.bank_account,
      amount_original: formatCurrency(collection.amount_original),
      extraCosts: formatCurrency(calculatedCollection),
      calculatedABB: formatCurrency(calculatedABB),
      total_amount: formatCurrency(total_amount),
      tenantName: tenant?.name || "Company Name",
    };

    // Renderiza el HTML con los datos
    // const result = await loadHtmlTemplate("collection/Aanmaning", dataReport);

    // // Generar PDF en memoria
    // const pdfBuffer = await htmlToPdfBuffer(result);

    // if (!pdfBuffer) {
    //   throw new Error("Failed to generate PDF");
    // }

    // const attachments = [
    //   {
    //     filename: `Aanmanning_${collection.reference_number}.pdf`,
    //     content: pdfBuffer.toString("base64"),
    //   },
    // ];

    // await sendAanmaningEmail(
    //   debtorEmail,
    //   debtor.fullname,
    //   invitationLink,
    //   subject,
    //   attachments
    // );

    await createNotification(
      collection.id,
      NotificationType.AANMANING,
      "Eerste incassoaankondiging",
      "De eerste incassoaankondiging is verzonden."
    );

    return "Aanmaning sent successfully";
  } catch (error) {
    console.error("Error sending Aanmaning:", error);
    throw new Error("Failed to send Aanmaning");
  }
};

export const sendSommatie = async (
  collection: CollectionCase
): Promise<string> => {
  try {
    // Obtiene params de cobranza
    const parameter = await getParameter();
    if (!parameter) {
      throw new Error("No se encontró el parámetro");
    }

    const debtor = await prisma.debtor.findUnique({
      where: { id: collection.debtor_id },
    });
    if (!debtor) {
      throw new Error("No se encontró el deudor");
    }

    // Si el deudor no tiene email, no envía la notificación
    if (!debtor.email) {
      throw new Error("El deudor no tiene email");
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: collection.tenant_id },
    });
    if (!tenant) {
      throw new Error("No se encontró el tenant");
    }

    if (!collection) {
      throw new Error("Collection not found");
    }

    const debtorEmail = debtor?.email;
    const subject = `Sommatie - ${collection.reference_number}`;

    const island = getNameCountry(tenant?.country_code);

    const extraCosts = collection.amount_original * 0.15;
    const calculatedABB = extraCosts * 0.06;
    const total_amount =
      collection.amount_original + extraCosts + calculatedABB;

    // Data for PDF generation
    const dataReport = {
      date: formatDate(new Date().toString()),
      debtorName: debtor?.fullname || "",
      debtorAddress: debtor?.address || "",
      island: island,
      reference_number: collection.reference_number,
      bankName: parameter.bank_account,
      accountNumber: parameter.bank_account,
      amount_original: collection.amount_original,
      extraCosts: extraCosts,
      calculatedABB: calculatedABB,
      total_amount: total_amount,
      tenantName: tenant?.name || "Company Name",
    };

    // // Renderiza el HTML con los datos
    // const result = await loadHtmlTemplate("collection/Sommatie", dataReport);

    // // Generar PDF en memoria
    // const pdfBuffer = await htmlToPdfBuffer(result);
    // if (!pdfBuffer) {
    //   throw new Error("Failed to generate PDF");
    // }

    // const attachments = [
    //   {
    //     filename: `Sommatie_${collection.reference_number}.pdf`,
    //     content: pdfBuffer.toString("base64"),
    //   },
    // ];

    // await sendSommatieEmail(debtorEmail, debtor.fullname, subject, attachments);

    await createNotification(
      collection.id,
      NotificationType.SOMMATIE,
      "Tweede incassobericht",
      "De tweede incassoaankondiging is verzonden."
    );

    return "Sommatie sent successfully";
  } catch (error) {
    console.error("Error sending Aanmaning:", error);
    throw new Error("Failed to send Aanmaning");
  }
};

export const sendIngebrekestelling = async (
  collection: CollectionCase
): Promise<string> => {
  try {
    // Obtiene params de cobranza
    const parameter = await getParameter();
    if (!parameter) {
      throw new Error("No se encontró el parámetro");
    }

    const debtor = await prisma.debtor.findUnique({
      where: { id: collection.debtor_id },
    });
    if (!debtor) {
      throw new Error("No se encontró el deudor");
    }

    // Si el deudor no tiene email, no envía la notificación
    if (!debtor.email) {
      throw new Error("El deudor no tiene email");
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: collection.tenant_id },
    });
    if (!tenant) {
      throw new Error("No se encontró el tenant");
    }

    if (!collection) {
      throw new Error("Collection not found");
    }

    const debtorEmail = debtor?.email;
    const subject = `Ingebrekestelling - ${collection.reference_number}`;

    const island = getNameCountry(tenant?.country_code);

    const firstReminderDate = await prisma.collectionCaseNotification.findFirst(
      {
        where: {
          collection_case_id: collection.id,
          type: "AANMANING",
        },
      }
    );

    console.log("firstReminderDate", firstReminderDate);
    if (!firstReminderDate) {
      throw new Error("First reminder date not found");
    }

    const secondReminderDate =
      await prisma.collectionCaseNotification.findFirst({
        where: {
          collection_case_id: collection.id,
          type: "SOMMATIE",
        },
      });

    console.log("secondReminderDate", secondReminderDate);
    if (!secondReminderDate) {
      throw new Error("Second reminder date not found");
    }

    // Data for PDF generation
    const dataReport = {
      date: formatDate(new Date().toString()),
      debtorName: debtor?.fullname || "",
      debtorAddress: debtor?.address || "",
      island: island,
      firstReminderDate: formatDate(firstReminderDate.sent_at.toString()),
      secondReminderDate: formatDate(secondReminderDate?.sent_at.toString()),
      accountNumber: parameter.bank_account,
      tenantName: tenant?.name || "Company Name",
    };

    // // Renderiza el HTML con los datos
    // const result = await loadHtmlTemplate(
    //   "collection/Ingebrekestelling",
    //   dataReport
    // );

    // // Generar PDF en memoria
    // const pdfBuffer = await htmlToPdfBuffer(result);
    // if (!pdfBuffer) {
    //   throw new Error("Failed to generate PDF");
    // }

    // const attachments = [
    //   {
    //     filename: `Ingebrekestelling_${collection.reference_number}.pdf`,
    //     content: pdfBuffer.toString("base64"),
    //   },
    // ];

    // await sendIngebrekestellingMail(
    //   debtorEmail,
    //   debtor.fullname,
    //   subject,
    //   attachments
    // );

    await createNotification(
      collection.id,
      NotificationType.INGEBREKESTELLING,
      "Derde incassoaankondiging",
      "De derde incassoaankondiging is verzonden."
    );

    return "Ingebrekestelling sent successfully";
  } catch (error) {
    console.error("Error sending Ingebrekestelling:", error);
    throw new Error("Failed to send Ingebrekestelling");
  }
};

export const sendBlokkade = async (
  collection: CollectionCase
): Promise<string> => {
  try {
    // Obtiene params de cobranza
    const parameter = await getParameter();
    if (!parameter) {
      throw new Error("No se encontró el parámetro");
    }

    const debtor = await prisma.debtor.findUnique({
      where: { id: collection.debtor_id },
    });
    if (!debtor) {
      throw new Error("No se encontró el deudor");
    }

    // Si el deudor no tiene email, no envía la notificación
    if (!debtor.email) {
      throw new Error("El deudor no tiene email");
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: collection.tenant_id },
    });
    if (!tenant) {
      throw new Error("No se encontró el tenant");
    }

    if (!collection) {
      throw new Error("Collection not found");
    }

    const params = {
      recipientName: debtor.fullname,
      messageBody: `Er is een blokkeringsverzoek geregistreerd op het Centraal Collectieplatform (CI). U kunt de gegevens veilig bekijken door in te loggen op het CI-platform: `,
    };

    const debtorEmail = debtor?.email;
    const templatePath = "collection/Notification";
    const subject = "Financiele Blokkade Notification";

    const island = getNameCountry(tenant?.country_code);

    // Data for PDF generation
    const dataReport = {
      date: formatDate(new Date().toString()),
      debtorName: debtor?.fullname || "",
      debtorAddress: debtor?.address || "",
      island: island,
      total_amount: 0,
      amountRegister: 0,
      total: 0,
      bankName: parameter.bank_account,
      accountNumber: parameter.bank_account,
    };

    // // Renderiza el HTML con los datos
    // const result = await loadHtmlTemplate(
    //   "collection/Ingebrekestelling",
    //   dataReport
    // );

    // // Generar PDF en memoria
    // const pdfBuffer = await htmlToPdfBuffer(result);
    // if (!pdfBuffer) {
    //   throw new Error("Failed to generate PDF");
    // }

    // const attachments = [
    //   {
    //     filename: `FinancieleBlokkade_${collection.reference_number}.pdf`,
    //     content: pdfBuffer.toString("base64"),
    //   },
    // ];

    // await sendBlokkadeMail(debtorEmail, debtor.fullname, subject, attachments);

    await createNotification(
      collection.id,
      NotificationType.BLOKKADE,
      "Notificatie van financiële blokkade",
      "De notificatie van financiële blokkade is verzonden."
    );

    return "Financiele Blokkade sent successfully";
  } catch (error) {
    console.error("Error sending FinancieleBlokkade:", error);
    throw new Error("Failed to send FinancieleBlokkade");
  }
};

export const getNotificationDays = async (
  status: $Enums.CollectionCaseStatus,
  person_type: $Enums.PersonType
): Promise<number> => {
  const _parameter = await getParameter();

  if (!_parameter) {
    throw new Error("Parameter not found");
  }

  if (status === $Enums.CollectionCaseStatus.AANMANING) {
    return person_type === $Enums.PersonType.INDIVIDUAL
      ? _parameter.consumer_aanmaning_term_days
      : _parameter.company_aanmaning_term_days;
  }

  if (status === $Enums.CollectionCaseStatus.SOMMATIE) {
    return person_type === $Enums.PersonType.INDIVIDUAL
      ? _parameter.consumer_sommatie_term_days
      : _parameter.company_sommatie_term_days;
  }

  return 0;
};

export const getLastNotificationDate = async (
  collection: CollectionCase,
  type: "AANMANING" | "SOMMATIE" | "INGEBREKESTELLING"
): Promise<Date> => {
  // Fetch the notification collection record based on collection and type
  const notificationRecord = await prisma.collectionCaseNotification.findFirst({
    where: {
      collection_case_id: collection.id,
      type: type, // Replace with the appropriate type if needed
    },
    orderBy: {
      sent_at: "desc", // Get the most recent notification
    },
  });

  console.log("notificationRecord", notificationRecord);

  if (!notificationRecord) {
    throw new Error(`Notification of type ${type} not found`);
  }

  return notificationRecord.sent_at;
};

export const getLastNotificationByCollectionCase = async (
  collection_case_id: string
): Promise<Notification | null> => {
  const notification = await prisma.collectionCaseNotification.findFirst({
    where: { collection_case_id },
    orderBy: { sent_at: "desc" },
  });

  if (!notification) {
    return null;
  }

  return {
    ...notification,
    type: notification.type as Notification["type"],
  };
};

export const getAllNotificationsByCollectionCase = async (
  collection_case_id: string
): Promise<Notification[]> => {
  const notifications = await prisma.collectionCaseNotification.findMany({
    where: { collection_case_id },
    orderBy: { sent_at: "desc" },
  });

  // Map the Prisma result to your Notification type if needed
  return notifications.map((n) => ({
    ...n,
    type: n.type as Notification["type"],
  }));
};
