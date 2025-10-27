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
} from "@react-email/components";

interface AanmanningEmailProps {
  userName: string;
  invitationLink: string;
}

export const AanmanningEmail = ({
  userName,
  invitationLink,
}: AanmanningEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>
        Er is een nieuwe incassotaak geregistreerd op het Central Inning (CI)
        Platform. U kunt de details van deze taak veilig bekijken door in te
        loggen op het CI Platform:
      </Preview>
      <Container style={container}>
        <Img
          src={"https://faktia.lat/static/LogoCIO.png"}
          width="170"
          height="50"
          alt="CI"
          style={logo}
        />
        <Text style={paragraph}>Beste {userName},</Text>
        <Text style={paragraph}>
          Er is een nieuwe incassotaak geregistreerd op het Central Inning (CI)
          Platform. U kunt de details van deze taak veilig bekijken door in te
          loggen op het CI Platform:
        </Text>
        <Section style={btnContainer}>
          <Button style={button} href={invitationLink}>
            Register
          </Button>
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

AanmanningEmail.PreviewProps = {
  userName: "Alan",
} as AanmanningEmailProps;

export default AanmanningEmail;

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

const button = {
  backgroundColor: "#FB902C",
  borderRadius: "3px",
  color: "#fff",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px",
};

const hr = {
  borderColor: "#cccccc",
  margin: "20px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
};
