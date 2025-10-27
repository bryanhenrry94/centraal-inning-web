import { NextResponse } from "next/server";
import { resend } from "@/lib/email";
import { TestEmail } from "@/emails/templates/TestEmail";
import { render } from "@react-email/components";
import React from "react";

export async function POST(req: Request) {
  try {
    const { to, name } = await req.json();

    if (!to || !name) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // const html = await render(<TestEmail name={name} />);
    const html = await render(React.createElement(TestEmail, { name }));

    const data = await resend.emails.send({
      from: `PortalCI <${process.env.MAIL_FROM || "no-reply@portalci.net"}>`, // Debe ser un dominio verificado en Resend
      to,
      subject: "Correo de prueba desde Next.js",
      html,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
