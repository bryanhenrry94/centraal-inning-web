import { WelcomeEmail } from "@/components/emails/WelcomeEmail";
import { render } from "@react-email/render";

export default async function Page() {
  const html = await render(<WelcomeEmail userFirstname="Bryan" />);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
