import { WelcomeEmail } from "@/emails/templates/WelcomeEmail";
import { Resend } from "resend";
import InvoiceEmail from "@/emails/templates/InvoiceEmail";
import AanmanningEmail from "@/emails/templates/AanmanningEmail";
import SommatieMail from "@/emails/templates/SommatieEmail";
import { InvoicePDF } from "@/pdfs/templates/InvoicePDF";
import { getDataInvoicePDF } from "./billing-invoice";
import { generatePdfBase64 } from "@/lib/pdf";
import prisma from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(to: string, userFirstname: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: `Centraal Inning <${process.env.EMAIL_FROM}>`,
      to: [to],
      subject: "Welcome to Centraal Inning",
      react: <WelcomeEmail userFirstname={userFirstname} />,
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

    await resend.emails.send({
      from: `Centraal Inning <${process.env.EMAIL_FROM}>`,
      to: to,
      subject: `FACTUUR - ${billing.invoice_number}`,
      react: (
        <InvoiceEmail
          name={billing.tenant.name || "Customer"}
          paymentLink={paymentLink}
        />
      ),
      attachments: attachments,
    });

    console.log("notificaCentraal Inningn de debtor enviada al correo: ", to);
    return true;
  } catch (error) {
    console.error("Error sending mail notification:", error);
    return false;
  }
};

export const sendAanmaningEmail = async (
  to: string,
  recipientName: string,
  invitationLink: string,
  subject: string,
  attachments?: any[]
) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `Centraal Inning <${process.env.EMAIL_FROM}>`,
      to: [to],
      subject: subject,
      react: (
        <AanmanningEmail
          userName={recipientName}
          invitationLink={invitationLink}
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

export const sendSommatieEmail = async (
  to: string,
  recipientName: string,
  subject: string,
  attachments?: any[]
) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `Centraal Inning <${process.env.EMAIL_FROM}>`,
      to: [to],
      subject: subject,
      react: <SommatieMail userName={recipientName} />,
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

export const sendIngebrekestellingMail = async (
  to: string,
  recipientName: string,
  subject: string,
  attachments?: any[]
) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `Centraal Inning <${process.env.EMAIL_FROM}>`,
      to: [to],
      subject: subject,
      react: <SommatieMail userName={recipientName} />,
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

export const sendBlokkadeMail = async (
  to: string,
  recipientName: string,
  subject: string,
  attachments?: any[]
) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `Centraal Inning <${process.env.EMAIL_FROM}>`,
      to: [to],
      subject: subject,
      react: <SommatieMail userName={recipientName} />,
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
