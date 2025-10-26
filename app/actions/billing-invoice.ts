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
import { getParameter } from "@/app/actions/parameter";
import { getNameCountry } from "@/common/utils/general";

interface ActivationInvoiceInput {
  tenant_id: string;
  island: string;
  address?: string | null;
  amount: number;
}

export const createActivationInvoice = async (
  params: ActivationInvoiceInput
) => {
  // Definir valores base
  const issue_date = new Date();
  const due_date = addDays(issue_date, 7);

  // Obtener parámetro necesario
  const parameter = await getParameter();
  if (!parameter) {
    throw new Error("No se encontró el parámetro");
  }

  // Costo base de activación
  const activationFee = params.amount;

  // Generar número de factura único
  const invoice_number = await generateInvoiceNumber();

  // Crear factura principal
  const invoice = await prisma.billingInvoice.create({
    data: {
      tenant_id: params.tenant_id,
      invoice_number,
      amount: activationFee,
      currency: "USD",
      issue_date,
      due_date,
      description:
        "Factura por activación de cuenta del sistema Centraal Inning",
      status: "unpaid",
    },
  });

  // Crear el detalle de factura
  await prisma.billingInvoiceDetail.create({
    data: {
      billing_invoice_id: invoice.id,
      item_description: "Registratiekosten",
      item_quantity: 1,
      item_unit_price: activationFee,
      item_total_price: activationFee,
      item_tax_rate: parameter.abb_rate / 100, // 6% ejemplo
      item_tax_amount: activationFee * (parameter.abb_rate / 100),
      item_total_with_tax: activationFee * (1 + parameter.abb_rate / 100),
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
  const issue_date = new Date();
  const due_date = addDays(issue_date, 7);
  const activationFee = params.amount; // Costo base de activación

  // Generar número de factura único
  const invoice_number = await generateInvoiceNumber();

  // Crear factura principal
  const invoice = await prisma.billingInvoice.create({
    data: {
      tenant_id: params.tenant_id,
      invoice_number,
      amount: activationFee,
      currency: "USD",
      issue_date,
      due_date,
      description:
        "Factura por activación de cuenta del sistema Centraal Inning",
      status: "unpaid",
    },
  });

  // Crear el detalle de factura
  await prisma.billingInvoiceDetail.create({
    data: {
      billing_invoice_id: invoice.id,
      item_description: "Servicekosten",
      item_quantity: 1,
      item_unit_price: activationFee,
      item_total_price: activationFee,
      item_tax_rate: 0.06, // 6% ejemplo
      item_tax_amount: activationFee * 0.06,
      item_total_with_tax: activationFee * 1.06,
    },
  });

  // Enviar correo con la factura al email de contacto del tenant
  await sendInvoiceEmail(invoice.id);

  return invoice;
};

export const generateInvoiceNumber = async (): Promise<string> => {
  const lastInvoice = await prisma.billingInvoice.findFirst({
    orderBy: { created_at: "desc" },
    select: { invoice_number: true },
  });

  let nextNumber = 1;

  if (lastInvoice?.invoice_number) {
    // Aseguramos que solo se tomen los dígitos
    const numeric = parseInt(lastInvoice.invoice_number.replace(/\D/g, ""), 10);
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

  const parameter = await getParameter();
  if (!parameter) {
    throw new Error("No se encontró el parámetro");
  }

  const island = getNameCountry(invoice.tenant.country_code);

  const data = {
    invoice_number: invoice.invoice_number,
    issue_date: invoice.issue_date.toISOString().split("T")[0],
    customerName: invoice.tenant.name,
    customerAddress: invoice.tenant.address || "N/A",
    customerIsland: island || "N/A",
    description: invoice.description,
    bank_name: parameter.bank_name || "MCB",
    bank_account: parameter.bank_account || "418.825.10",
    details: invoice.details.map((detail) => ({
      item_description: detail.item_description,
      item_quantity: detail.item_quantity,
      item_unit_price: detail.item_unit_price.toFixed(2),
      item_tax_rate: detail.item_tax_rate.toFixed(2),
      item_subtotal: detail.item_total_with_tax.toFixed(2),
    })),
    subtotal: invoice.details
      .reduce((acc, detail) => acc + detail.item_total_with_tax, 0)
      .toFixed(2),
    tax: invoice.details
      .reduce((acc, detail) => acc + detail.item_tax_amount, 0)
      .toFixed(2),
    total: invoice.details
      .reduce((acc, detail) => acc + detail.item_total_with_tax, 0)
      .toFixed(2),
  };

  const html = renderTemplate("invoice/invoice", {
    ...data,
    company_name: "Dazzsoft",
  });

  const browser = await puppeteer.launch({
    headless: true,
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

    if (createdInvoice.tenant?.contact_email) {
      const debtorEmail = createdInvoice.tenant.contact_email;
      const subject = `FACTUUR - ${createdInvoice.invoice_number}`;

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

    // Map invoices to match the expected type, renaming details to invoice_details and ensuring 'island' is present
    return invoices.map((invoice) => ({
      tenant_id: invoice.tenant_id,
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      amount: invoice.amount,
      currency: invoice.currency,
      issue_date: invoice.issue_date,
      status: invoice.status as "unpaid" | "paid" | "overdue",
      due_date: invoice.due_date,
      created_at: invoice.created_at,
      updated_at: invoice.updated_at,
      description: invoice.description,
      invoice_details: invoice.details.map((detail) => ({
        id: detail.id,
        invoice_id: detail.billing_invoice_id ?? invoice.id,
        item_description: detail.item_description,
        item_quantity: detail.item_quantity,
        item_unit_price: detail.item_unit_price,
        item_total_price: detail.item_total_price,
        item_tax_rate: detail.item_tax_rate,
        item_tax_amount: detail.item_tax_amount,
        item_total_with_tax: detail.item_total_with_tax,
        created_at: detail.created_at,
        updated_at: detail.updated_at,
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
  tenant_id: string
): Promise<BillingInvoiceBase> => {
  try {
    console.log("Creating invoice:", invoice);
    const newInvoice = await prisma.billingInvoice.create({
      data: {
        invoice_number: invoice.invoice_number,
        issue_date: invoice.issue_date,
        due_date: invoice.due_date,
        description: invoice.description,
        status: invoice.status,
        tenant_id: tenant_id,
        currency: "USD",
        amount: invoice.amount ?? 0,
      },
    });

    await prisma.billingInvoiceDetail.createMany({
      data: (invoice.invoice_details ?? []).map((detail) => ({
        item_description: detail.item_description,
        item_quantity: detail.item_quantity,
        item_unit_price: detail.item_unit_price,
        item_total_price: detail.item_total_price,
        item_tax_rate: detail.item_tax_rate,
        item_tax_amount: detail.item_tax_amount,
        item_total_with_tax: detail.item_total_with_tax,
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
        invoice_number: invoice.invoice_number,
        issue_date: invoice.issue_date,
        due_date: invoice.due_date,
        description: invoice.description,
        status: invoice.status,
      },
    });

    // Delete existing invoice details
    await prisma.billingInvoiceDetail.deleteMany({
      where: { billing_invoice_id: id },
    });

    // Re-create invoice details
    await prisma.billingInvoiceDetail.createMany({
      data: (invoice.invoice_details ?? []).map((detail) => ({
        item_description: detail.item_description,
        item_quantity: detail.item_quantity,
        item_unit_price: detail.item_unit_price,
        item_total_price: detail.item_total_price,
        item_tax_rate: detail.item_tax_rate,
        item_tax_amount: detail.item_tax_amount,
        item_total_with_tax: detail.item_total_with_tax,
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
  tenant_id: string
): Promise<string> => {
  try {
    const parameter = await getParameter();
    if (!parameter) {
      throw new Error("No se encontró el parámetro");
    }

    const lastInvoice = await prisma.billingInvoice.findFirst({
      where: { tenant_id },
      orderBy: { created_at: "desc" },
    });

    let nextNumber = parameter.invoice_sequence || 1;
    if (lastInvoice && lastInvoice.invoice_number) {
      const match = lastInvoice.invoice_number.match(/(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    const nextInvoiceNumber = `${parameter.invoice_prefix || ""}${String(
      nextNumber
    ).padStart(parameter.invoice_number_length || 5, "0")}`;

    return nextInvoiceNumber;
  } catch (error) {
    throw new Error("Error generating next invoice number");
  }
};
