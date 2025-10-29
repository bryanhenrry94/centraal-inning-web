import { WelcomeEmail } from "@/emails/templates/WelcomeEmail";
import { Resend } from "resend";
import InvoiceEmail from "@/emails/templates/InvoiceEmail";
import AanmanningEmail from "@/emails/templates/AanmanningEmail";
import SommatieMail from "@/emails/templates/SommatieEmail";
import { InvoicePDF } from "@/pdfs/templates/InvoicePDF";
import { getDataInvoicePDF } from "./billing-invoice";
import { generatePdfBase64 } from "@/lib/pdf";
import prisma from "@/lib/prisma";
import AanmaningPDF, { AanmaningPDFProps } from "@/pdfs/templates/AanmaningPDF";
import { formatDate, getNameCountry } from "@/common/utils/general";
import { getParameter } from "./parameter";
import SommatiePDF, { SommatiePDFProps } from "@/pdfs/templates/SommatiePDF";
import IngebrekestellingPDF, {
  IngebrekestellingProps,
} from "@/pdfs/templates/IngebrekestellingPDF";
import { BlokkadeEmail, IngebrekestellingEmail } from "@/emails";
import BlokkadePDF, { BlokkadePDFProps } from "@/pdfs/templates/BlokkadePDF";

const resend = new Resend(process.env.RESEND_API_KEY);

const getEmailByEnv = async (to: string) => {
  const isDev = process.env.NODE_ENV === "development";
  const devRedirect = process.env.DEV_EMAIL_REDIRECT;

  if (isDev && devRedirect) {
    console.log(`🔸 [DEV MODE] Redirecting email to: ${devRedirect}`);
    return [devRedirect];
  }

  return [to];
};

export async function sendWelcomeEmail(to: string, fullname: string) {
  try {
    const recipient = await getEmailByEnv(to);

    const { data, error } = await resend.emails.send({
      from: `${process.env.EMAIL_SENDER_NAME} <${process.env.EMAIL_FROM}>`,
      to: recipient,
      subject: `Welkom bij ${process.env.NEXT_PUBLIC_APP_NAME || "Centraal Inning"}`,
      react: (
        <WelcomeEmail
          logoUrl={process.env.NEXT_PUBLIC_LOGO_URL || ""}
          fullname={fullname}
          appUrl={
            process.env.NEXT_PUBLIC_APP_URL || "https://www.centraalinning.com"
          }
        />
      ),
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    console.error("Error sending email:", error);
    return Response.json({ error }, { status: 500 });
  }
}

export const sendInvoiceEmail = async (
  to: string,
  invoice_id: string
): Promise<boolean> => {
  try {
    if (!to) {
      console.error("Recipient email is required");
      return false;
    }

    if (!invoice_id) {
      console.error("Invoice ID is required");
      return false;
    }

    const billing = await prisma.billingInvoice.findUnique({
      where: { id: invoice_id },
      include: { tenant: true },
    });

    if (!billing) {
      console.error("Invoice not found for ID:", invoice_id);
      return false;
    }

    // Generar el PDF de la factura
    const params = await getDataInvoicePDF(invoice_id);
    const pdfBase64 = await generatePdfBase64(<InvoicePDF {...params} />);

    const attachments = [
      {
        filename: `invoice.pdf`,
        content: pdfBase64,
      },
    ];

    const paymentLink = `https://portalci.net/pay-invoice/${billing.id}`;

    const recipient = await getEmailByEnv(to);

    await resend.emails.send({
      from: `${process.env.EMAIL_SENDER_NAME} <${process.env.EMAIL_FROM}>`,
      to: recipient,
      subject: `FACTUUR - ${billing.invoice_number}`,
      react: (
        <InvoiceEmail
          logoUrl={process.env.NEXT_PUBLIC_LOGO_URL || ""}
          fullname={billing.tenant.name || "Customer"}
          paymentLink={paymentLink}
        />
      ),
      attachments: attachments,
    });

    console.log(
      "${process.env.EMAIL_SENDER_NAME} - Invoice enviada al correo: ",
      to
    );
    return true;
  } catch (error) {
    console.error("Error sending mail notification:", error);
    return false;
  }
};

export const sendAanmaningEmail = async (
  to: string,
  caseId: string,
  invitationLink?: string
) => {
  try {
    // Generar el PDF de la aanmaning
    const collection = await prisma.collectionCase.findUnique({
      where: { id: caseId },
      include: { tenant: true, debtor: true },
    });

    if (!collection) {
      throw new Error("Collection case not found");
    }

    const parameter = await getParameter();

    if (!parameter) {
      throw new Error("Parameters not found");
    }

    const island = getNameCountry(collection.tenant.country_code);

    const params: AanmaningPDFProps = {
      logoUrl: process.env.NEXT_PUBLIC_LOGO_URL || "",
      date: formatDate(collection.issue_date.toString()),
      debtorName: collection.debtor.fullname || "Debtor",
      debtorAddress: collection.debtor.address || "",
      island: island || "Bonaire",
      reference_number: collection.reference_number || "",
      total_amount: collection.total_due.toFixed(2),
      bankName: parameter.bank_name || "Bank Name",
      accountNumber: parameter.bank_account || "Account Number",
      amount_original: collection.amount_original.toFixed(2),
      extraCosts: collection.fee_amount.toFixed(2),
      calculatedABB: collection.abb_amount.toFixed(2),
      tenantName: collection.tenant.name || "Tenant",
    };

    const pdfBase64 = await generatePdfBase64(<AanmaningPDF {...params} />);

    const attachments = [
      {
        filename: `Aanmaning.pdf`,
        content: pdfBase64,
      },
    ];

    const recipient = await getEmailByEnv(to);

    const { data, error } = await resend.emails.send({
      from: `${process.env.EMAIL_SENDER_NAME} <${process.env.EMAIL_FROM}>`,
      to: recipient,
      subject: `Aanmaning - ${collection.reference_number}`,
      react: (
        <AanmanningEmail
          logoUrl={process.env.NEXT_PUBLIC_LOGO_URL || ""}
          fullname={collection.debtor.fullname || "Debtor"}
          invitationLink={
            invitationLink ? invitationLink : "https://centraalinning.com/"
          }
        />
      ),
      attachments: attachments,
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    console.log(
      "Send_Aanmaning: Aanmaning email sent successfully to XXX:",
      to
    );

    return Response.json(data);
  } catch (error) {
    console.error("Error sending email:", error);
    return Response.json({ error }, { status: 500 });
  }
};

export const sendSommatieEmail = async (to: string, caseId: string) => {
  try {
    const collection = await prisma.collectionCase.findUnique({
      where: { id: caseId },
      include: { tenant: true, debtor: true },
    });

    if (!collection) {
      throw new Error("Collection case not found");
    }

    const island = getNameCountry(collection.tenant.country_code);

    const params: SommatiePDFProps = {
      logoUrl: process.env.NEXT_PUBLIC_LOGO_URL || "",
      date: formatDate(collection.issue_date.toString()),
      debtorName: collection.debtor.fullname || "Debtor",
      debtorAddress: collection.debtor.address || "",
      island: island || "Bonaire",
      invoice_number: collection.reference_number || "",
      invoiceAmount: collection.total_due.toFixed(2),
    };

    const pdfBase64 = await generatePdfBase64(<SommatiePDF {...params} />);

    const attachments = [
      {
        filename: `Sommatie.pdf`,
        content: pdfBase64,
      },
    ];

    const recipient = await getEmailByEnv(to);

    const { data, error } = await resend.emails.send({
      from: `${process.env.EMAIL_SENDER_NAME} <${process.env.EMAIL_FROM}>`,
      to: recipient,
      subject: `Sommatie - ${collection.reference_number}`,
      react: (
        <SommatieMail
          logoUrl={process.env.NEXT_PUBLIC_LOGO_URL || ""}
          fullname={collection.debtor.fullname || "Debtor"}
        />
      ),
      attachments: attachments,
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    console.error("Error sending email:", error);
    return Response.json({ error }, { status: 500 });
  }
};

export const sendIngebrekestellingMail = async (to: string, caseId: string) => {
  try {
    const collection = await prisma.collectionCase.findUnique({
      where: { id: caseId },
      include: { tenant: true, debtor: true },
    });

    if (!collection) {
      throw new Error("Collection case not found");
    }

    const parameter = await getParameter();

    if (!parameter) {
      throw new Error("Parameters not found");
    }

    const island = getNameCountry(collection.tenant.country_code);

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

    const params: IngebrekestellingProps = {
      logoUrl: process.env.NEXT_PUBLIC_LOGO_URL || "",
      date: formatDate(collection.issue_date.toString()),
      debtorName: collection.debtor.fullname || "Debtor",
      debtorAddress: collection.debtor.address || "",
      island: island || "Bonaire",
      firstReminderDate: formatDate(firstReminderDate.sent_at.toString()),
      secondReminderDate: formatDate(secondReminderDate.sent_at.toString()),
      accountNumber: parameter.bank_account || "Account Number",
      tenantName: collection.tenant.name || "Tenant",
    };

    const pdfBase64 = await generatePdfBase64(
      <IngebrekestellingPDF {...params} />
    );

    const attachments = [
      {
        filename: `Ingebrekestelling.pdf`,
        content: pdfBase64,
      },
    ];

    const recipient = await getEmailByEnv(to);

    const { data, error } = await resend.emails.send({
      from: `${process.env.EMAIL_SENDER_NAME} <${process.env.EMAIL_FROM}>`,
      to: recipient,
      subject: `Ingebrekestelling - ${collection.reference_number}`,
      react: (
        <IngebrekestellingEmail
          logoUrl={process.env.NEXT_PUBLIC_LOGO_URL || ""}
          fullname={collection.debtor.fullname || "Debtor"}
        />
      ),
      attachments: attachments,
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    console.error("Error sending email:", error);
    return Response.json({ error }, { status: 500 });
  }
};

export const sendBlokkadeMail = async (to: string, caseId: string) => {
  try {
    const collection = await prisma.collectionCase.findUnique({
      where: { id: caseId },
      include: { tenant: true, debtor: true },
    });

    if (!collection) {
      throw new Error("Collection case not found");
    }

    const parameter = await getParameter();

    if (!parameter) {
      throw new Error("Parameters not found");
    }

    const island = getNameCountry(collection.tenant.country_code);

    const params: BlokkadePDFProps = {
      logoUrl: process.env.NEXT_PUBLIC_LOGO_URL || "",
      debtorName: collection.debtor.fullname || "Debtor",
      debtorAddress: collection.debtor.address || "",
      island: island || "Bonaire",
      total_amount: collection.total_due.toFixed(2),
      amountRegister: collection.amount_original.toFixed(2),
      total: collection.total_due.toFixed(2),
      bankName: parameter.bank_name || "Bank Name",
      accountNumber: parameter.bank_account || "Account Number",
    };

    const pdfBase64 = await generatePdfBase64(<BlokkadePDF {...params} />);

    const attachments = [
      {
        filename: `Blokkade.pdf`,
        content: pdfBase64,
      },
    ];

    const recipient = await getEmailByEnv(to);

    const { data, error } = await resend.emails.send({
      from: `${process.env.EMAIL_SENDER_NAME} <${process.env.EMAIL_FROM}>`,
      to: recipient,
      subject: `Blokkade - ${collection.reference_number}`,
      react: (
        <BlokkadeEmail
          logoUrl={process.env.NEXT_PUBLIC_LOGO_URL || ""}
          fullname={collection.debtor.fullname || "Debtor"}
        />
      ),
      attachments: attachments,
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    console.error("Error sending email:", error);
    return Response.json({ error }, { status: 500 });
  }
};
