import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register fonts
Font.register({
  family: "Arial",
  src: "https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxK.woff2",
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Arial",
    fontSize: 10,
    color: "#222",
    padding: 18,
    backgroundColor: "#fff",
  },
  sheet: {
    width: "100%",
    minHeight: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  logo: {
    width: 200,
    height: 125,
    marginLeft: -55,
    marginTop: -40,
  },
  meta: {
    textAlign: "right",
    fontSize: 12,
    lineHeight: 1.3,
    marginTop: -60,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  billTo: {
    marginTop: 36,
    marginBottom: 42,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  client: {
    fontSize: 12,
    lineHeight: 1.4,
    maxWidth: 400,
  },
  content: {
    marginTop: 80,
  },
  paragraph: {
    textAlign: "justify",
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 1.4,
  },
  attention: {
    fontSize: 12,
    marginTop: 40,
    marginBottom: 8,
    fontWeight: "bold",
  },
  listItem: {
    textAlign: "justify",
    fontSize: 12,
    marginBottom: 4,
    paddingLeft: 12,
    lineHeight: 1.4,
  },
  closing: {
    fontSize: 12,
    marginTop: 40,
    lineHeight: 1.4,
  },
  footer: {
    fontSize: 12,
    color: "#555",
    paddingTop: 8,
    marginTop: 190,
    textAlign: "center",
  },
});

export interface SommatiePDFProps {
  date: string;
  debtorName: string;
  debtorAddress: string;
  island: string;
  invoice_number: string;
  invoiceAmount: string;
}

const SommatiePDF: React.FC<SommatiePDFProps> = ({
  date,
  debtorName,
  debtorAddress,
  island,
  invoice_number,
  invoiceAmount,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.sheet}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <Image
              style={styles.logo}
              src="https://dazzsoft.com/wp-content/uploads/2025/09/LogoCIO.png"
            />
          </View>
          <View style={styles.meta}>
            <Text style={styles.title}>Sommatie tot Ingebrekestelling</Text>
            <Text>Verzenddatum: {date}</Text>
          </View>
        </View>

        <View style={styles.billTo}>
          <View style={styles.client}>
            <Text style={{ fontWeight: "bold" }}>Aan:</Text>
            <Text>{debtorName}</Text>
            <Text>{debtorAddress}</Text>
            <Text>{island}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.paragraph}>
            Op 9 oktober 2024 ontving u een eerste aanmaning inzake
            factuurnummer {invoice_number} (USD {invoiceAmount}). Tot op heden
            hebben wij geen betaling of betalingsregeling van u ontvangen.
          </Text>

          <Text style={styles.paragraph}>
            Wij sommeren u hierbij om het volledige bedrag binnen twee (2) dagen
            na dagtekening van deze sommatie over te maken naar
            MCB-rekeningnummer 418.825.10, onder vermelding van uw naam,
            bedrijfsnaam of factuurnummer.
          </Text>

          <Text style={styles.paragraph}>
            Voor betaling, het treffen van een regeling of contact met de
            schuldeiser kunt u zich registreren of inloggen via:
            www.centraalinning.com
          </Text>

          <Text style={styles.paragraph}>
            Indien u niet binnen de gestelde termijn betaalt of een regeling
            treft, wordt u hiermee formeel in gebreke gesteld.
          </Text>

          <Text style={styles.attention}>Let op:</Text>

          <Text style={styles.listItem}>
            • Bij uitblijven van betaling wordt uw schuld verhoogd met USD 93,00
            verzuimkosten.
          </Text>
          <Text style={styles.listItem}>
            • U wordt vervolgens formeel in gebreke gesteld.
          </Text>
          <Text style={styles.listItem}>
            • Uw schuld wordt geregistreerd in het Centraal Incassoregister
            (CI).
          </Text>
          <Text style={styles.listItem}>
            • U wordt geblokkeerd voor buitengerechtelijke handelingen op
            Bonaire.
          </Text>
          <Text style={styles.listItem}>
            • ABGI kan, na controle van de procedure, formeel opdracht geven tot
            inning.
          </Text>
          <Text style={styles.listItem}>
            • Alle aangesloten deelnemers, waaronder banken en
            overheidsinstanties, zijn verplicht mee te werken aan deze
            maatregel.
          </Text>

          <Text style={styles.paragraph}>
            Alle kosten die hieruit voortvloeien, komen volledig voor uw
            rekening.
          </Text>

          <Text style={styles.paragraph}>
            Wij adviseren u dringend deze kwestie tijdig op te lossen om verdere
            maatregelen te voorkomen.
          </Text>

          <View style={styles.closing}>
            <Text>Met vriendelijke groet,</Text>
            <Text>Dazzsoft</Text>
            <Text>Schuldeiser</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>
            Deze sommatie is automatisch verzonden via het Centraal
            Incassoplatform (CI).
          </Text>
        </View>
      </View>
    </Page>
  </Document>
);

export default SommatiePDF;
