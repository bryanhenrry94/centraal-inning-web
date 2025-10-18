import { createTransporter } from "@/common/mail/config/nodemailer";
import { EmailOptions } from "@/common/mail/types/emailTypes";
import renderTemplate from "@/common/utils/templateRenderer";

class UserMailService {
  static async sendInvitation(
    to: string,
    companyName: string,
    link: string
  ): Promise<void> {
    const templateParam = { companyName, link };

    // const html = renderTemplate("user/invitation", templateParam);
    const html = "";
    const mailOptions: EmailOptions = {
      from: process.env.SMTP_USER as string,
      to,
      subject: `Invitation to join ${companyName} on ${process.env.APP_DOMAIN}`,
      html,
    };
    await createTransporter().sendMail(mailOptions);
  }
}

export default UserMailService;
