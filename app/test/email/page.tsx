import { TestEmail } from "@/emails";
import { render } from "@react-email/render";

export default async function Page() {
  const html = await render(<TestEmail name="Bryan Navarrete" />);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
