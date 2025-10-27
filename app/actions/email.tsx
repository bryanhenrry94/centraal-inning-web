import { WelcomeEmail } from "@/emails/templates/WelcomeEmail";
import { Resend } from "resend";
import InvoiceEmail from "@/emails/templates/InvoiceEmail";
import AanmanningEmail from "@/emails/templates/AanmanningEmail";
import SommatieMail from "@/emails/templates/SommatieEmail";
import ReactPDF from "@react-pdf/renderer";
import { InvoicePDF } from "@/pdfs/templates/InvoicePDF";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(to: string, userFirstname: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: `CIO <${process.env.EMAIL_FROM}>`,
      to: [to],
      subject: "Welcome to CIO Platform",
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

export async function sendInvoiceEmail(
  to: string,
  userName: string,
  paymentLink: string,
  attachments?: any[]
) {
  try {
    const pdfData = {
      name: "Bryan",
      amount: 500,
    };

    const pdfBuffer = await ReactPDF.renderToStream(
      <InvoicePDF {...pdfData} />
    );

    const buffer = await streamToBuffer(pdfBuffer);
    // return buffer.toString("base64");

    const { data, error } = await resend.emails.send({
      from: `CIO <${process.env.EMAIL_FROM}>`,
      to: [to],
      subject: "Your Invoice from CIO Platform",
      react: <InvoiceEmail userName={userName} paymentLink={paymentLink} />,
      attachments: [
        {
          filename: "invoice.pdf",
          content: buffer.toString("base64"),
        },
      ],
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

/**
 * Convierte un NodeJS.ReadableStream en un Buffer
 * @param stream - Stream de NodeJS
 * @returns Promise<Buffer>
 */
async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    // TypeScript reconoce chunk como Buffer | string
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}
export const sendAanmaningEmail = async (
  to: string,
  recipientName: string,
  invitationLink: string,
  subject: string,
  attachments?: any[]
) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `CIO <${process.env.EMAIL_FROM}>`,
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
      from: `CIO <${process.env.EMAIL_FROM}>`,
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
      from: `CIO <${process.env.EMAIL_FROM}>`,
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
      from: `CIO <${process.env.EMAIL_FROM}>`,
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
