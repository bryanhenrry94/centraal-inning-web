"use server";
import prisma from "@/lib/prisma";
import CollectionService from "@/common/mail/services/collectionService";
import { validateTenantById } from "@/app/actions/tenant";
import { CollectionCase } from "@/lib/validations/collection";
import { getCollectionById } from "@/app/actions/collection";
import { Notification } from "@/lib/validations/notification";
import { getParameterById } from "@/app/actions/parameter";
import { NotificationType } from "@/lib/validations/notification";

import renderTemplate from "@/common/utils/templateRenderer";
import path from "path";
import puppeteer from "puppeteer";
import {
  formatCurrency,
  formatDate,
  getNameCountry,
} from "@/common/utils/general";

export const sendNotification = async (
  tenantId: string,
  colleccionCaseId: string
) => {
  if (!colleccionCaseId) {
    throw new Error("Notification colleccionCaseId is required");
  }

  // Check if the tenant exists
  const tenant = await validateTenantById(tenantId);
  if (!tenant) {
    throw new Error("Tenant not found");
  }
  // Check if the notification.collectionCase exists
  const collection = await getCollectionById(colleccionCaseId);
  if (!collection) {
    throw new Error("Collection not found");
  }

  // Get the last notification for the collection case
  const notification = await getLastNotificationByCollectionCase(
    colleccionCaseId
  );

  const notificationType = notification ? notification.type : "";

  switch (notificationType) {
    case "AANMANING":
      return await sendSommatie(collection);
    case "SOMMATIE":
      return await sendIngebrekestelling(collection);
    case "INGEBREKESTELLING":
      // if (collection.debtorId) {
      //   const contribution: ICreateDebtorContribution = {
      //     debtorId: collection.debtorId,
      //     isPublic: false,
      //     notes: null,
      //   };

      //   await createContribution(tenantId, contribution);
      // }

      return await sendBlokkade(collection);
    case "BLOKKADE":
      throw new Error("No further notifications can be sent");
    default:
      return await sendAanmaning(collection);
  }
};

export const createNotification = async (
  colleccionCaseId: string,
  type: NotificationType,
  title: string,
  message: string
): Promise<Notification> => {
  if (!colleccionCaseId) {
    throw new Error("Notification colleccionCaseId is required");
  }

  const notification = await prisma.notification.create({
    data: {
      collectionCaseId: colleccionCaseId,
      type,
      sentAt: new Date(),
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
    if (!collection.tenantId) {
      throw new Error("Tenant ID not found");
    }

    // Obtiene params de cobranza
    const PARAMETER_ID = process.env.NEXT_PUBLIC_PARAMETER_ID || "";
    const parameter = await getParameterById(PARAMETER_ID);
    if (!parameter) {
      throw new Error("No se encontró el parámetro");
    }

    // Obtiene datos del deudor
    const debtor = await prisma.debtor.findUnique({
      where: { id: collection.debtorId },
    });
    if (!debtor) {
      throw new Error("No se encontró el deudor");
    }

    // Si el deudor no tiene email, no envía la notificación
    if (!debtor.email) {
      throw new Error("El deudor no tiene email");
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: collection.tenantId },
    });
    if (!tenant) {
      throw new Error("No se encontró el tenant");
    }

    // Porcentajes de cobranza y abb
    const collectionPercentage = parameter.porcCobranza || 15;
    const abbPercentage = parameter.porcAbb || 6;

    // Calculate additional fees
    const calculatedCollection = parseFloat(
      ((collection.amountOriginal * collectionPercentage) / 100).toFixed(2)
    );
    // Calculate ABB
    const calculatedABB = parseFloat(
      ((calculatedCollection * abbPercentage) / 100).toFixed(2)
    );

    const fine = 0; // This should be calculated based on the collection and the days overdue
    const validDays = 14;

    // calcula interes
    const daysLate = collection.dueDate
      ? Math.ceil(
          (new Date().getTime() - new Date(collection.dueDate).getTime()) /
            (1000 * 3600 * 24)
        )
      : 0;

    const subtotaal =
      collection.amountOriginal + calculatedCollection + calculatedABB + fine;

    // Interest 5% of total amount
    const interestAmount = parseFloat(((subtotaal * 5) / 100).toFixed(2));

    // Total Amount
    const totalAmount = parseFloat((subtotaal + interestAmount).toFixed(2));

    // Create the notification object
    const params = {
      recipientName: debtor.fullname,
      messageBody: `Er is een nieuwe incassotaak geregistreerd op het Central Inning (CI)
          Platform. U kunt de details van deze taak veilig bekijken door in te
          loggen op het CI Platform:`,
    };

    const debtorEmail = debtor?.email;
    const templatePath = "collection/Notification";
    const subject = `Aanmaning - ${collection.referenceNumber}`;

    const island = getNameCountry(tenant?.countryCode);

    // Data for PDF generation
    const dataReport = {
      date: formatDate(new Date().toString()),
      debtorName: debtor?.fullname || "",
      debtorAddress: debtor?.address || "",
      island: island,
      referenceNumber: collection.referenceNumber,
      bankName: parameter.bankAccount,
      accountNumber: parameter.bankAccount,
      amountOriginal: formatCurrency(collection.amountOriginal),
      extraCosts: formatCurrency(calculatedCollection),
      calculatedABB: formatCurrency(calculatedABB),
      totalAmount: formatCurrency(totalAmount),
      tenantName: tenant?.name || "Company Name",
    };
    const pdfBuffer = await generatePDF("collection/Aanmaning", dataReport);
    if (!pdfBuffer) {
      throw new Error("Failed to generate PDF");
    }

    // Guardar el PDF en una ruta temporal
    const tempDir = path.join(process.cwd(), "tmp");
    const fs = await import("fs/promises");
    await fs.mkdir(tempDir, { recursive: true });

    const tempFilePath = path.join(
      tempDir,
      `Aanmanning_${collection.referenceNumber}.pdf`
    );
    await fs.writeFile(tempFilePath, pdfBuffer);

    // Configurar el adjunto usando el archivo temporal
    const attachmentConfig = {
      filename: `Aanmanning_${collection.referenceNumber}.pdf`,
      pdfTemplatePath: tempFilePath,
    };

    if (debtorEmail) {
      // Send the first notification (AANMANING)
      await CollectionService.sendEmail(
        debtorEmail,
        templatePath,
        subject,
        params,
        attachmentConfig
      );

      await createNotification(
        collection.id,
        NotificationType.AANMANING,
        "Primera notificación de cobranza",
        "Se ha enviado la primera notificación de cobranza."
      );
    }

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
    const PARAMETER_ID = process.env.NEXT_PUBLIC_PARAMETER_ID || "";

    // Obtiene params de cobranza
    const parameter = await getParameterById(PARAMETER_ID);
    if (!parameter) {
      throw new Error("No se encontró el parámetro");
    }

    const debtor = await prisma.debtor.findUnique({
      where: { id: collection.debtorId },
    });
    if (!debtor) {
      throw new Error("No se encontró el deudor");
    }

    // Si el deudor no tiene email, no envía la notificación
    if (!debtor.email) {
      throw new Error("El deudor no tiene email");
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: collection.tenantId },
    });
    if (!tenant) {
      throw new Error("No se encontró el tenant");
    }

    if (!collection) {
      throw new Error("Collection not found");
    }

    const params = {
      recipientName: debtor.fullname,
      messageBody: `Er is een nieuwe incassotaak geregistreerd op het Central Inning (CI)
          Platform. U kunt de details van deze taak veilig bekijken door in te
          loggen op het CI Platform: `,
    };

    const debtorEmail = debtor?.email;
    const templatePath = "collection/Notification";
    const subject = `Sommatie - ${collection.referenceNumber}`;

    const island = getNameCountry(tenant?.countryCode);

    const extraCosts = collection.amountOriginal * 0.15;
    const calculatedABB = extraCosts * 0.06;
    const totalAmount = collection.amountOriginal + extraCosts + calculatedABB;

    // Data for PDF generation
    const dataReport = {
      date: formatDate(new Date().toString()),
      debtorName: debtor?.fullname || "",
      debtorAddress: debtor?.address || "",
      island: island,
      referenceNumber: collection.referenceNumber,
      bankName: parameter.bankAccount,
      accountNumber: parameter.bankAccount,
      amountOriginal: collection.amountOriginal,
      extraCosts: extraCosts,
      calculatedABB: calculatedABB,
      totalAmount: totalAmount,
      tenantName: tenant?.name || "Company Name",
    };
    const pdfBuffer = await generatePDF("collection/Sommatie", dataReport);
    if (!pdfBuffer) {
      throw new Error("Failed to generate PDF");
    }

    // Guardar el PDF en una ruta temporal
    const tempDir = path.join(process.cwd(), "tmp");
    const fs = await import("fs/promises");
    await fs.mkdir(tempDir, { recursive: true });

    const tempFilePath = path.join(
      tempDir,
      `Sommatie_${collection.referenceNumber}.pdf`
    );
    await fs.writeFile(tempFilePath, pdfBuffer);

    // Configurar el adjunto usando el archivo temporal
    const attachmentConfig = {
      filename: `Aanmanning_${collection.referenceNumber}.pdf`,
      pdfTemplatePath: tempFilePath,
    };

    await CollectionService.sendEmail(
      debtorEmail,
      templatePath,
      subject,
      params,
      attachmentConfig
    );

    await createNotification(
      collection.id,
      NotificationType.SOMMATIE,
      "Segunda notificación de cobranza",
      "Se ha enviado la segunda notificación de cobranza."
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
    const PARAMETER_ID = process.env.NEXT_PUBLIC_PARAMETER_ID || "";

    // Obtiene params de cobranza
    const parameter = await getParameterById(PARAMETER_ID);
    if (!parameter) {
      throw new Error("No se encontró el parámetro");
    }

    const debtor = await prisma.debtor.findUnique({
      where: { id: collection.debtorId },
    });
    if (!debtor) {
      throw new Error("No se encontró el deudor");
    }

    // Si el deudor no tiene email, no envía la notificación
    if (!debtor.email) {
      throw new Error("El deudor no tiene email");
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: collection.tenantId },
    });
    if (!tenant) {
      throw new Error("No se encontró el tenant");
    }

    if (!collection) {
      throw new Error("Collection not found");
    }

    const params = {
      recipientName: debtor.fullname,
      messageBody: `Er is een nieuwe incassotaak geregistreerd op het Central Inning (CI)
          Platform. U kunt de details van deze taak veilig bekijken door in te
          loggen op het CI Platform: `,
    };

    const debtorEmail = debtor?.email;
    const templatePath = "collection/Notification";
    const subject = `Ingebrekestelling - ${collection.referenceNumber}`;

    const island = getNameCountry(tenant?.countryCode);

    const firstReminderDate = await prisma.notification.findFirst({
      where: {
        collectionCaseId: collection.id,
        type: "AANMANING",
      },
    });

    console.log("firstReminderDate", firstReminderDate);
    if (!firstReminderDate) {
      throw new Error("First reminder date not found");
    }

    const secondReminderDate = await prisma.notification.findFirst({
      where: {
        collectionCaseId: collection.id,
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
      firstReminderDate: formatDate(firstReminderDate.sentAt.toString()),
      secondReminderDate: formatDate(secondReminderDate?.sentAt.toString()),
      accountNumber: parameter.bankAccount,
      tenantName: tenant?.name || "Company Name",
    };
    const pdfBuffer = await generatePDF(
      "collection/Ingebrekestelling",
      dataReport
    );
    if (!pdfBuffer) {
      throw new Error("Failed to generate PDF");
    }

    // Guardar el PDF en una ruta temporal
    const tempDir = path.join(process.cwd(), "tmp");
    const fs = await import("fs/promises");
    await fs.mkdir(tempDir, { recursive: true });

    const tempFilePath = path.join(
      tempDir,
      `Ingebrekestelling_${collection.referenceNumber}.pdf`
    );
    await fs.writeFile(tempFilePath, pdfBuffer);

    // Configurar el adjunto usando el archivo temporal
    const attachmentConfig = {
      filename: `Ingebrekestelling_${collection.referenceNumber}.pdf`,
      pdfTemplatePath: tempFilePath,
    };

    await CollectionService.sendEmail(
      debtorEmail,
      templatePath,
      subject,
      params,
      attachmentConfig
    );

    await createNotification(
      collection.id,
      NotificationType.INGEBREKESTELLING,
      "Tercera notificación de cobranza",
      "Se ha enviado la tercera notificación de cobranza."
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
    const PARAMETER_ID = process.env.NEXT_PUBLIC_PARAMETER_ID || "";

    // Obtiene params de cobranza
    const parameter = await getParameterById(PARAMETER_ID);
    if (!parameter) {
      throw new Error("No se encontró el parámetro");
    }

    const debtor = await prisma.debtor.findUnique({
      where: { id: collection.debtorId },
    });
    if (!debtor) {
      throw new Error("No se encontró el deudor");
    }

    // Si el deudor no tiene email, no envía la notificación
    if (!debtor.email) {
      throw new Error("El deudor no tiene email");
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: collection.tenantId },
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

    const island = getNameCountry(tenant?.countryCode);

    // Data for PDF generation
    const dataReport = {
      date: formatDate(new Date().toString()),
      debtorName: debtor?.fullname || "",
      debtorAddress: debtor?.address || "",
      island: island,
      totalAmount: 0,
      amountRegister: 0,
      total: 0,
      bankName: parameter.bankAccount,
      accountNumber: parameter.bankAccount,
    };

    const pdfBuffer = await generatePDF(
      "collection/FinancieleBlokkade",
      dataReport
    );
    if (!pdfBuffer) {
      throw new Error("Failed to generate PDF");
    }

    // Guardar el PDF en una ruta temporal
    const tempDir = path.join(process.cwd(), "tmp");
    const fs = await import("fs/promises");
    await fs.mkdir(tempDir, { recursive: true });

    const tempFilePath = path.join(
      tempDir,
      `FinancieleBlokkade_${collection.referenceNumber}.pdf`
    );
    await fs.writeFile(tempFilePath, pdfBuffer);

    // Configurar el adjunto usando el archivo temporal
    const attachmentConfig = {
      filename: `FinancieleBlokkade_${collection.referenceNumber}.pdf`,
      pdfTemplatePath: tempFilePath,
    };

    await CollectionService.sendEmail(
      debtorEmail,
      templatePath,
      subject,
      params,
      attachmentConfig
    );

    await createNotification(
      collection.id,
      NotificationType.BLOKKADE,
      "Notificación de bloqueo financiero",
      "Se ha enviado la notificación de bloqueo financiero."
    );

    return "Financiele Blokkade sent successfully";
  } catch (error) {
    console.error("Error sending FinancieleBlokkade:", error);
    throw new Error("Failed to send FinancieleBlokkade");
  }
};

export const sendABGILetterToEmployer = async (
  collection: CollectionCase
): Promise<string> => {
  try {
    // if (!collection.tenant?.id) {
    //   throw new Error("Tenant ID not found");
    // }
    // const params: iBlockRecordCreate = {
    //   issueDate: new Date(),
    //   claimantCompanyId: collection.tenant?.id,
    //   city: "",
    //   claimantCompanyAddress: collection.tenant?.address || "",
    //   debtorId: collection.debtorId || "",
    //   debtorName: collection.debtor?.fullname || "",
    //   caseNumber: collection.invoiceNumber || "",
    //   totalAmountUsd: collection.invoiceAmount || 0,
    //   blockStatus: BlockStatus.ACTIVE,
    //   abgiResponsible: process.env.ABGI_MANAGER_NAME || "ABGI Manager",
    //   contactedCompany: "Dazzsoft",
    //   contactedCompanyEmail: "jnavarrete@dazzsoft.com",
    //   contactedCompanyPhone: "123456789",
    // };
    // const record = await createBlockRecord(params);
    // if (!record) {
    //   throw new Error("Failed to create block record");
    // }
    // const response = await sendBlockRecordEmail(record.id);
    // if (!response.success) {
    //   throw new Error(
    //     response.message || "Failed to send ABGI letter to employer"
    //   );
    // }
    // return response.message || "ABGI letter sent successfully";
    return "ABGI letter sent successfully";
  } catch (error) {
    console.error("Error sending ABGI letter to employer:", error);
    throw new Error("Failed to send ABGI letter to employer");
  }
};

export const sendBetalingsbewijs = async (
  debtorName: string,
  paymentMethod: string,
  paymentAmount: number,
  referenceNumber: string,
  email: string,
  invoiceNumber: string
): Promise<string> => {
  try {
    // Create the notification object
    const notification = {
      paymentDate: new Date().toISOString(),
      debtorName,
      paymentMethod,
      paymentAmount,
      referenceNumber,
    };
    console.log("notification", notification);

    const debtorEmail = email;
    const templatePath = "collection/Betalingsbewijs";
    const subject = `Betalingsbewijs - ${invoiceNumber}`;

    if (debtorEmail) {
      console.log("debtorEmail", debtorEmail);
      await CollectionService.sendEmail(
        debtorEmail,
        templatePath,
        subject,
        notification
      );
    }

    return Promise.resolve("Betalingsbewijs sent successfully");
  } catch (error) {
    console.error("Error sending Betalingsbewijs:", error);
    throw new Error("Failed to send Betalingsbewijs");
  }
};

export const getNotificationDays = async (
  status: string,
  personType: "individual" | "company"
): Promise<number> => {
  const PARAMETER_ID = process.env.NEXT_PUBLIC_PARAMETER_ID || "";
  const _parameter = await getParameterById(PARAMETER_ID);

  if (!_parameter) {
    throw new Error("Parameter not found");
  }

  if (status === "AANMANING") {
    return personType === "individual"
      ? _parameter.diasPlazoConsumidorSommatie
      : _parameter.diasPlazoEmpresaSommatie;
  }

  if (status === "SOMMATIE") {
    return personType === "individual"
      ? _parameter.diasPlazoConsumidorSommatie
      : _parameter.diasPlazoEmpresaSommatie;
  }

  return 0;
};

export const getLastNotificationDate = async (
  collection: CollectionCase,
  type: "AANMANING" | "SOMMATIE" | "INGEBREKESTELLING"
): Promise<Date> => {
  // Fetch the notification collection record based on collection and type
  const notificationRecord = await prisma.notification.findFirst({
    where: {
      collectionCaseId: collection.id,
      type: type, // Replace with the appropriate type if needed
    },
    orderBy: {
      sentAt: "desc", // Get the most recent notification
    },
  });

  console.log("notificationRecord", notificationRecord);

  if (!notificationRecord) {
    throw new Error(`Notification of type ${type} not found`);
  }

  return notificationRecord.sentAt;
};

export const getLastNotificationByCollectionCase = async (
  collectionCaseId: string
): Promise<Notification | null> => {
  const notification = await prisma.notification.findFirst({
    where: { collectionCaseId },
    orderBy: { sentAt: "desc" },
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
  collectionCaseId: string
): Promise<Notification[]> => {
  const notifications = await prisma.notification.findMany({
    where: { collectionCaseId },
    orderBy: { sentAt: "desc" },
  });

  // Map the Prisma result to your Notification type if needed
  return notifications.map((n) => ({
    ...n,
    type: n.type as Notification["type"],
  }));
};

export const generatePDF = async (
  report: string,
  data: any
): Promise<Buffer> => {
  const html = renderTemplate(report, {
    ...data,
    companyName: "Dazzsoft",
  });

  const browser = await puppeteer.launch({
    headless: true,
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", // Update this path if Chrome is installed elsewhere
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({ format: "A4" });

  await browser.close();

  return Buffer.from(pdfBuffer);
};
