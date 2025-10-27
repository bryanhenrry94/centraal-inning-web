import { Resend } from "resend";
import { ReactElement } from "react";
import { render } from "@react-email/components";

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
  attachments,
}: {
  to: string;
  subject: string;
  html: string;
  attachments?: { filename: string; content: string }[];
}) {
  return resend.emails.send({
    from: `PortalCI <${process.env.MAIL_FROM || "no-reply@portalci.net"}>`,
    to,
    subject,
    html,
    attachments,
  });
}
