import { createTransporter } from "@/common/mail/config/nodemailer";
import { EmailOptions } from "@/common/mail/types/emailTypes";
import renderTemplate from "@/common/utils/templateRenderer";

class EmailService {
  static async sendWelcomeEmail(to: string, name: string): Promise<void> {
    // const html = renderTemplate("welcome", { name });
    const html = "";
    const mailOptions: EmailOptions = {
      from: process.env.SMTP_USER as string,
      to,
      subject: "Bienvenido a nuestro servicio",
      html,
    };
    await createTransporter().sendMail(mailOptions);
  }

  static async sendResetPasswordEmail(to: string, link: string): Promise<void> {
    // const html = renderTemplate("reset-password", { link });
    const html = "";
    const mailOptions: EmailOptions = {
      from: process.env.SMTP_USER as string,
      to,
      subject: "Restablecer contraseña",
      html,
    };
    await createTransporter().sendMail(mailOptions);
  }

  // You can add more email services here for each module
}

export default EmailService;
