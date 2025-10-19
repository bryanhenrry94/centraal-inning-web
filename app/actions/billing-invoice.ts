"use server";
import prisma from "@/lib/prisma";
import InvoiceService from "@/common/mail/services/invoiceService";
import renderTemplate from "@/common/utils/templateRenderer";
import { addDays } from "date-fns";
import path from "path";
import puppeteer from "puppeteer";
import {
  BillingInvoiceBase,
  BillingInvoiceCreate,
  BillingInvoiceResponse,
} from "@/lib/validations/billing-invoice";
import { getParameterById } from "@/app/actions/parameter";
import { getNameCountry } from "@/common/utils/general";

interface ActivationInvoiceInput {
  tenantId: string;
  planId?: string;
  island: string;
  address?: string | null;
  amount: number;
}

export const createActivationInvoice = async (
  params: ActivationInvoiceInput
) => {
  // Definir valores base
  const issueDate = new Date();
  const dueDate = addDays(issueDate, 7);

  // Costo base de activación
  const activationFee = params.amount;

  // Generar número de factura único
  const invoiceNumber = await generateInvoiceNumber();

  // Crear factura principal
  const invoice = await prisma.billingInvoice.create({
    data: {
      tenantId: params.tenantId,
      invoiceNumber,
      amount: activationFee,
      currency: "USD",
      issueDate,
      dueDate,
      description:
        "Factura por activación de cuenta del sistema Centraal Inning",
      status: "unpaid",
    },
  });

  // Crear el detalle de factura
  await prisma.billingInvoiceDetail.create({
    data: {
      billingInvoiceId: invoice.id,
      itemDescription: "Registratiekosten",
      itemQuantity: 1,
      itemUnitPrice: activationFee,
      itemTotalPrice: activationFee,
      itemTaxRate: 0.06, // 6% ejemplo
      itemTaxAmount: activationFee * 0.06,
      itemTotalWithTax: activationFee * 1.06,
    },
  });

  // Enviar correo con la factura al email de contacto del tenant
  await sendInvoiceEmail(invoice.id);

  return invoice;
};

export const createCollectionInvoice = async (
  params: ActivationInvoiceInput
) => {
  // Definir valores base
  const issueDate = new Date();
  const dueDate = addDays(issueDate, 7);
  const activationFee = params.amount; // Costo base de activación

  // Generar número de factura único
  const invoiceNumber = await generateInvoiceNumber();

  // Crear factura principal
  const invoice = await prisma.billingInvoice.create({
    data: {
      tenantId: params.tenantId,
      invoiceNumber,
      amount: activationFee,
      currency: "USD",
      issueDate,
      dueDate,
      description:
        "Factura por activación de cuenta del sistema Centraal Inning",
      status: "unpaid",
    },
  });

  // Crear el detalle de factura
  await prisma.billingInvoiceDetail.create({
    data: {
      billingInvoiceId: invoice.id,
      itemDescription: "Servicekosten",
      itemQuantity: 1,
      itemUnitPrice: activationFee,
      itemTotalPrice: activationFee,
      itemTaxRate: 0.06, // 6% ejemplo
      itemTaxAmount: activationFee * 0.06,
      itemTotalWithTax: activationFee * 1.06,
    },
  });

  // Enviar correo con la factura al email de contacto del tenant
  await sendInvoiceEmail(invoice.id);

  return invoice;
};

export const generateInvoiceNumber = async (): Promise<string> => {
  const lastInvoice = await prisma.billingInvoice.findFirst({
    orderBy: { createdAt: "desc" },
    select: { invoiceNumber: true },
  });

  let nextNumber = 1;

  if (lastInvoice?.invoiceNumber) {
    // Aseguramos que solo se tomen los dígitos
    const numeric = parseInt(lastInvoice.invoiceNumber.replace(/\D/g, ""), 10);
    if (!isNaN(numeric)) {
      nextNumber = numeric + 1;
    }
  }

  const formattedNumber = nextNumber.toString().padStart(6, "0");

  console.log("Next invoice number:", formattedNumber);

  return formattedNumber;
};

export const generateInvoicePDF = async (id: string): Promise<Buffer> => {
  const invoice = await prisma.billingInvoice.findUnique({
    where: { id },
    include: { tenant: true, details: true },
  });

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  const PARAMETER_ID = process.env.NEXT_PUBLIC_PARAMETER_ID || "";
  const parameter = await getParameterById(PARAMETER_ID);
  if (!parameter) {
    throw new Error("No se encontró el parámetro");
  }

  const island = getNameCountry(invoice.tenant.countryCode);

  const data = {
    invoiceNumber: invoice.invoiceNumber,
    issueDate: invoice.issueDate.toISOString().split("T")[0],
    customerName: invoice.tenant.name,
    customerAddress: invoice.tenant.address || "N/A",
    customerIsland: island || "N/A",
    description: invoice.description,
    bankName: parameter.bankName || "MCB",
    bankAccount: parameter.bankAccount || "418.825.10",
    details: invoice.details.map((detail) => ({
      itemDescription: detail.itemDescription,
      itemQuantity: detail.itemQuantity,
      itemUnitPrice: detail.itemUnitPrice.toFixed(2),
      itemTax: detail.itemTaxAmount.toFixed(2),
      itemSubtotal: detail.itemTotalWithTax.toFixed(2),
    })),
    subtotal: invoice.details
      .reduce((acc, detail) => acc + detail.itemTotalWithTax, 0)
      .toFixed(2),
    tax: invoice.details
      .reduce((acc, detail) => acc + detail.itemTaxAmount, 0)
      .toFixed(2),
    total: invoice.details
      .reduce((acc, detail) => acc + detail.itemTotalWithTax, 0)
      .toFixed(2),
  };

  const html = renderTemplate("invoice/invoice", {
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

export const sendInvoiceEmail = async (id: string): Promise<boolean> => {
  try {
    const createdInvoice = await prisma.billingInvoice.findUnique({
      where: { id },
      include: { tenant: true },
    });

    if (!createdInvoice) return false;

    if (createdInvoice.tenant?.contactEmail) {
      const debtorEmail = createdInvoice.tenant.contactEmail;
      const subject = `FACTUUR - ${createdInvoice.invoiceNumber}`;

      const dataMail = {
        recipientName: createdInvoice.tenant.name || "Customer",
        currentYear: new Date().getFullYear(),
        messageBody:
          "Er is een nieuwe factuur geregistreerd in het Centraal Incasso Platform (CI). U kunt de gegevens veilig bekijken door in te loggen op het CI-platform:",
      };

      const pdfBuffer = await generateInvoicePDF(id);

      if (pdfBuffer) {
        // Guardar el PDF en una ruta temporal
        const tempDir = path.join(process.cwd(), "tmp");
        const fs = await import("fs/promises");
        await fs.mkdir(tempDir, { recursive: true });
        const tempFilePath = path.join(
          tempDir,
          `invoice_${createdInvoice.id}.pdf`
        );
        await fs.writeFile(tempFilePath, pdfBuffer);

        // Configurar el adjunto usando el archivo temporal
        const attachmentConfig = {
          filename: `invoice_${createdInvoice.id}.pdf`,
          pdfTemplatePath: tempFilePath,
        };

        if (attachmentConfig.pdfTemplatePath) {
          await InvoiceService.sendEmail(
            debtorEmail,
            subject,
            dataMail,
            attachmentConfig
          );
        }
      } else {
        await InvoiceService.sendEmail(debtorEmail, subject, dataMail);
      }

      console.log("notificacion de debtor enviada al correo: ", debtorEmail);
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error sending mail notification:", error);
    return false;
  }
};

export const getAllInvoices = async (): Promise<BillingInvoiceResponse[]> => {
  try {
    const invoices = await prisma.billingInvoice.findMany({
      include: {
        details: true,
      },
    });

    // Map invoices to match the expected type, renaming details to invoiceDetails and ensuring 'island' is present
    return invoices.map((invoice) => ({
      tenantId: invoice.tenantId,
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.amount,
      currency: invoice.currency,
      issueDate: invoice.issueDate,
      status: invoice.status as "unpaid" | "paid" | "overdue",
      dueDate: invoice.dueDate,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
      description: invoice.description,
      invoiceDetails: invoice.details.map((detail) => ({
        id: detail.id,
        invoiceId: detail.billingInvoiceId ?? invoice.id,
        itemDescription: detail.itemDescription,
        itemQuantity: detail.itemQuantity,
        itemUnitPrice: detail.itemUnitPrice,
        itemTotalPrice: detail.itemTotalPrice,
        itemTaxRate: detail.itemTaxRate,
        itemTaxAmount: detail.itemTaxAmount,
        itemTotalWithTax: detail.itemTotalWithTax,
        createdAt: detail.createdAt,
        updatedAt: detail.updatedAt,
      })),
    }));
  } catch (error) {
    throw new Error("Error fetching invoices");
  }
};

export const getInvoiceById = async (
  id: string
): Promise<BillingInvoiceBase | null> => {
  try {
    const invoice = await prisma.billingInvoice.findUnique({
      where: { id },
      include: {
        tenant: true,
      },
    });

    if (!invoice) return null;

    return {
      ...invoice,
      status: invoice.status as "unpaid" | "paid" | "overdue",
    };
  } catch (error) {
    throw new Error("Error fetching invoice");
  }
};

export const createInvoice = async (
  invoice: BillingInvoiceCreate,
  tenantId: string
): Promise<BillingInvoiceBase> => {
  try {
    console.log("Creating invoice:", invoice);
    const newInvoice = await prisma.billingInvoice.create({
      data: {
        invoiceNumber: invoice.invoiceNumber,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        description: invoice.description,
        status: invoice.status,
        tenantId: tenantId,
        currency: "USD",
        amount: invoice.amount ?? 0,
      },
    });

    await prisma.billingInvoiceDetail.createMany({
      data: (invoice.invoiceDetails ?? []).map((detail) => ({
        itemDescription: detail.itemDescription,
        itemQuantity: detail.itemQuantity,
        itemUnitPrice: detail.itemUnitPrice,
        itemTotalPrice: detail.itemTotalPrice,
        itemTaxRate: detail.itemTaxRate,
        itemTaxAmount: detail.itemTaxAmount,
        itemTotalWithTax: detail.itemTotalWithTax,
        invoiceId: newInvoice.id,
      })),
    });

    return {
      ...newInvoice,
      status: newInvoice.status as "unpaid" | "paid" | "overdue",
    };
  } catch (error) {
    throw new Error("Error creating invoice");
  }
};

export const updateInvoice = async (
  id: string,
  invoice: Partial<BillingInvoiceCreate>
): Promise<boolean> => {
  try {
    const updatedInvoice = await prisma.billingInvoice.update({
      where: { id },
      data: {
        invoiceNumber: invoice.invoiceNumber,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        description: invoice.description,
        status: invoice.status,
      },
    });

    // Delete existing invoice details
    await prisma.billingInvoiceDetail.deleteMany({
      where: { billingInvoiceId: id },
    });

    // Re-create invoice details
    await prisma.billingInvoiceDetail.createMany({
      data: (invoice.invoiceDetails ?? []).map((detail) => ({
        itemDescription: detail.itemDescription,
        itemQuantity: detail.itemQuantity,
        itemUnitPrice: detail.itemUnitPrice,
        itemTotalPrice: detail.itemTotalPrice,
        itemTaxRate: detail.itemTaxRate,
        itemTaxAmount: detail.itemTaxAmount,
        itemTotalWithTax: detail.itemTotalWithTax,
        invoiceId: updatedInvoice.id,
      })),
    });

    return updatedInvoice ? true : false;
  } catch (error) {
    throw new Error("Error updating invoice");
  }
};

export const deleteInvoice = async (id: string): Promise<boolean> => {
  try {
    const deletedInvoice = await prisma.billingInvoice.delete({
      where: { id },
    });

    return deletedInvoice ? true : false;
  } catch (error) {
    throw new Error("Error deleting invoice");
  }
};

export const getNextInvoiceNumber = async (
  tenantId: string
): Promise<string> => {
  try {
    const PARAMETER_ID = process.env.NEXT_PUBLIC_PARAMETER_ID || "";
    const parameter = await getParameterById(PARAMETER_ID);
    if (!parameter) {
      throw new Error("No se encontró el parámetro");
    }

    const lastInvoice = await prisma.billingInvoice.findFirst({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    });

    let nextNumber = parameter.invoiceSecuence || 1;
    if (lastInvoice && lastInvoice.invoiceNumber) {
      const match = lastInvoice.invoiceNumber.match(/(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    const nextInvoiceNumber = `${parameter.invoicePrefix || ""}${String(
      nextNumber
    ).padStart(parameter.invoiceNumberLength || 5, "0")}`;

    return nextInvoiceNumber;
  } catch (error) {
    throw new Error("Error generating next invoice number");
  }
};
