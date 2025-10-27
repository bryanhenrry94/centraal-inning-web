import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Link,
} from "@react-email/components";

interface WelcomeEmailProps {
  userFirstname: string;
}

export const WelcomeEmail = ({ userFirstname }: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>
        Intelligentieplatform voor efficiënt en gecentraliseerd
        incassomanagement.
      </Preview>
      <Container style={container}>
        <Img
          src={"https://dazzsoft.com/wp-content/uploads/2025/09/LogoCIO.png"}
          width="170"
          height="50"
          alt="CI"
          style={logo}
        />
        <Text style={paragraph}>Hallo {userFirstname},</Text>
        <Text style={paragraph}>
          Welkom bij CI, uw intelligentieplatform voor efficiënt en
          gecentraliseerd incassomanagement.
        </Text>
        <Section style={btnContainer}>
          <Text>
            <Link href="https://portalci.net/">www.portalci.net</Link>
          </Text>
        </Section>
        <Text style={paragraph}>
          Met vriendelijke groet,
          <br />
          Het CI-team
        </Text>
        <Hr style={hr} />
        <Text style={footer}>
          Dit bericht is automatisch gegenereerd door het Centraal
          Incassoplatform (CI).
        </Text>
      </Container>
    </Body>
  </Html>
);

WelcomeEmail.PreviewProps = {
  userFirstname: "Alan",
} as WelcomeEmailProps;

export default WelcomeEmail;

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
};

const logo = {
  margin: "0 auto",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
};

const btnContainer = {
  textAlign: "center" as const,
};

const hr = {
  borderColor: "#cccccc",
  margin: "20px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
};
