"use server";
import { createTransporter } from "@/common/mail/config/nodemailer";
import { EmailOptions } from "@/common/mail/types/emailTypes";
import renderTemplate from "@/common/utils/templateRenderer";

class AuthMailService {
  static async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const templateParam = {
      clientName: name,
      company_name: process.env.COMPANY_NAME || "",
      emailSuport: process.env.SUPPORT_EMAIL || "",
    };
    const html = renderTemplate("auth/welcome", templateParam);
    const mailOptions: EmailOptions = {
      from: process.env.SMTP_USER as string,
      to,
      subject: `Welkom bij ${process.env.COMPANY_NAME || "Centraal Inning"}`,
      html,
    };
    await createTransporter().sendMail(mailOptions);
  }

  static async sendVerificationEmail(to: string, link: string): Promise<void> {
    const templateParam = {
      company_name: process.env.COMPANY_NAME || "",
      emailSupport: process.env.SUPPORT_EMAIL || "",
      link: link,
    };
    const html = renderTemplate("auth/verify-email", templateParam);
    const mailOptions: EmailOptions = {
      from: process.env.SMTP_USER as string,
      to,
      subject: "[Confirm your email]",
      html,
    };
    await createTransporter().sendMail(mailOptions);
  }

  static async sendResetPasswordEmail(to: string, link: string): Promise<void> {
    const templateParam = {
      company_name: process.env.COMPANY_NAME || "",
      link: link,
    };
    // const html = renderTemplate("auth/reset-password", templateParam);
    const html = "";
    const mailOptions: EmailOptions = {
      from: process.env.SMTP_USER as string,
      to,
      subject: "[Reset password]",
      html,
    };
    await createTransporter().sendMail(mailOptions);
  }

  static async sendInvitationCompanyEmail(
    to: string,
    name: string,
    subdomain: string,
    link: string
  ): Promise<void> {
    const templateParam = {
      guestName: name,
      company_name: subdomain || "",
      url: link,
    };
    // const html = renderTemplate("company/invitacion-company", templateParam);
    const html = "";
    const mailOptions: EmailOptions = {
      from: process.env.SMTP_USER as string,
      to,
      subject: `You've been invited to join the collaborative debt collection network! 🎉`,
      html,
    };
    await createTransporter().sendMail(mailOptions);
  }
}

export default AuthMailService;
