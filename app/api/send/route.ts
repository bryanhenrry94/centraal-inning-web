import { EmailTemplate } from "@/components/email-template";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    const { data, error } = await resend.emails.send({
      from: "Acme <no-reply@faktia.lat>",
      to: ["bryanhenrry94@gmail.com"],
      subject: "Hello world",
      react: EmailTemplate({ firstName: "Bryan" }),
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
