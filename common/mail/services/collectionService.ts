import { createTransporter } from "@/common/mail/config/nodemailer";
import { EmailOptions } from "@/common/mail/types/emailTypes";
import renderTemplate from "@/common/utils/templateRenderer";

// This method is used to send an email with a PDF attachment
class CollectionService {
  static async sendEmail(
    to: string,
    templatePath: string,
    subject: string,
    data: any,
    attachmentConfig?: { filename: string; pdfTemplatePath: string }
  ): Promise<void> {
    try {
      // 1, Generar HTML desde plantilla
      const html = renderTemplate(templatePath, {
        ...data,
        companyName: "Dazzsoft",
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

      console.log(`sendMail: ${to}`);

      await createTransporter().sendMail(mailOptions);
    } catch (error) {
      console.error("Error sending collection email:", error);
      throw error;
    }
  }
}

export default CollectionService;
