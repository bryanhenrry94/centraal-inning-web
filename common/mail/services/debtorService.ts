import { createTransporter } from "@/common/mail/config/nodemailer";
import { EmailOptions } from "@/common/mail/types/emailTypes";
import renderTemplate from "@/common/utils/templateRenderer";

class DebtorServiceMail {
  static async sendContribution(
    to: string,
    company_name: string,
    debtorName: string,
    link: string
  ): Promise<void> {
    const templateParam = { company_name, debtorName, link };

    // const html = renderTemplate("debtor/contribution", templateParam);
    const html = "";
    const mailOptions: EmailOptions = {
      from: process.env.SMTP_USER as string,
      to,
      subject: `Ayúdanos a obtener más información del deudor para la cobranza colectiva de ${company_name}`,
      html,
    };

    await createTransporter().sendMail(mailOptions);
  }
}

export default DebtorServiceMail;
