import { InvoicePDF } from "@/pdfs";
import { generatePdfBase64 } from "@/lib/pdf";
import { sendEmail } from "@/lib/email";

interface SendInvoiceParams {
  name: string;
  email: string;
  amount: number;
}

/**
 * Server Action: Genera el PDF, lo convierte a Base64 y envía el correo con adjunto
 */
export async function sendInvoiceAction({
  name,
  email,
  amount,
}: SendInvoiceParams) {
  // 1️⃣ Generar PDF en Base64
  const pdfBase64 = await generatePdfBase64(
    <InvoicePDF name={name} amount={amount} />
  );

  // 2️⃣ Enviar correo con Resend
  await sendEmail({
    to: email,
    subject: "Tu factura",
    template: (
      <div>
        <p>Hola {name},</p>
        <p>Adjuntamos tu factura por ${amount}.</p>
      </div>
    ),
    attachments: [
      {
        filename: `Factura-${name}.pdf`,
        content: pdfBase64,
      },
    ],
  });

  return { success: true };
}
