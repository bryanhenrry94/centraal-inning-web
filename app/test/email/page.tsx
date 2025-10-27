import { InvoiceEmail } from "@/emails/templates/InvoiceEmail";
import { render } from "@react-email/render";

export default async function Page() {
  const html = await render(<InvoiceEmail userName="DAZZSOFT S.A.S." />);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
