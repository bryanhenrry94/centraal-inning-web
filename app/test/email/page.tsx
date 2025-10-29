import {
  AanmanningEmail,
  IngebrekestellingEmail,
  InvoiceEmail,
  SommatieEmail,
  WelcomeEmail,
} from "@/emails";
import { render } from "@react-email/render";

export default async function Page() {
  const params = {
    logoUrl: "/static/logo.png",
    fullname: "Bryan Navarrete",
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://www.centraalinning.com",
  };
  const html = await render(<WelcomeEmail {...params} />);

  // const params = {
  //   logoUrl: "/static/logo.png",
  //   fullname: "Bryan Navarrete",
  // };
  // const html = await render(<AanmanningEmail {...params} />);

  // const params = {
  //   logoUrl: "/static/logo.png",
  //   fullname: "Bryan Navarrete",
  // };
  // const html = await render(<SommatieEmail {...params} />);

  // const params = {
  //   logoUrl: "/static/logo.png",
  //   fullname: "Bryan Navarrete",
  // };
  // const html = await render(<IngebrekestellingEmail {...params} />);

  // const params = {
  //   logoUrl: "/static/logo.png",
  //   fullname: "Bryan Navarrete",
  //   paymentLink: "https://example.com/pay-invoice/12345",
  // };
  // const html = await render(<InvoiceEmail {...params} />);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
