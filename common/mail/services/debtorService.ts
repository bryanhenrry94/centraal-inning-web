import { createTransporter } from "@/common/mail/config/nodemailer";
import { EmailOptions } from "@/common/mail/types/emailTypes";
import renderTemplate from "@/common/utils/templateRenderer";

class DebtorServiceMail {
  static async sendContribution(
    to: string,
    companyName: string,
    debtorName: string,
    link: string
  ): Promise<void> {
    const templateParam = { companyName, debtorName, link };

    // const html = renderTemplate("debtor/contribution", templateParam);
    const html = "";
    const mailOptions: EmailOptions = {
      from: process.env.SMTP_USER as string,
      to,
      subject: `Ayúdanos a obtener más información del deudor para la cobranza colectiva de ${companyName}`,
      html,
    };

    await createTransporter().sendMail(mailOptions);
  }
}

export default DebtorServiceMail;
