import { Resend } from "resend";
import { ReactElement } from "react";
import { render } from "@react-email/components";

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  template,
  attachments,
}: {
  to: string;
  subject: string;
  template: ReactElement;
  attachments?: { filename: string; content: string }[];
}) {
  const html = await render(template);
  return resend.emails.send({
    from: "no-reply@faktia.com",
    to,
    subject,
    html,
    attachments,
  });
}
