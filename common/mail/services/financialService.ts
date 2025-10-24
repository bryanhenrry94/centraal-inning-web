import { createTransporter } from "@/common/mail/config/nodemailer";
import { EmailOptions } from "@/common/mail/types/emailTypes";
import renderTemplate from "@/common/utils/templateRenderer";

class FinancialService {
  // This method is used to send an email with a PDF attachment
  static async sendEmail(
    to: string,
    subject: string,
    data: any,
    attachmentConfig?: { filename: string; pdfTemplatePath: string }
  ): Promise<void> {
    // 1, Generar HTML desde plantilla
    const html = renderTemplate("financial/notification", {
      ...data,
      company_name: "Dazzsoft",
    });

    const mailOptions: EmailOptions = {
      from: process.env.SMTP_USER as string,
      to,
      subject,
      html,
    };

    if (attachmentConfig) {
      const attachments = attachmentConfig.pdfTemplatePath
        ? [
            {
              filename: attachmentConfig.filename,
              path: attachmentConfig.pdfTemplatePath,
            },
          ]
        : [];

      mailOptions.attachments = attachments;
    }

    console.log(`email: ${to}`);

    await createTransporter().sendMail(mailOptions);
  }
}

export default FinancialService;
