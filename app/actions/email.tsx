import { EmailTemplate } from "@/components/email-template";
import { WelcomeEmail } from "@/components/emails/WelcomeEmail";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(to: string, userFirstname: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: `CIO <${process.env.EMAIL_FROM}>`,
      to: [to],
      subject: "Welcome to CIO Platform",
      react: EmailTemplate({ firstName: userFirstname }),
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    console.error("Error sending email:", error);
    return Response.json({ error }, { status: 500 });
  }
}
