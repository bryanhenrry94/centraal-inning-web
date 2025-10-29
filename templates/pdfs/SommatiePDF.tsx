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

// Register fonts - using a more reliable font source or fallback to system fonts
Font.register({
  family: "Helvetica",
  src: "Helvetica",
});

// Define styles
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 14,
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
    color: "#222",
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
  },
  logo: {
    width: 100,
    height: 60,
  },
  meta: {
    textAlign: "right",
    fontSize: 16,
    alignItems: "flex-end",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  billTo: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  client: {
    fontSize: 12,
    lineHeight: 1.4,
    maxWidth: 400,
  },
  content: {
    marginTop: 40,
  },
  paragraph: {
    fontSize: 12,
    lineHeight: 1.4,
    textAlign: "justify",
    marginBottom: 10,
  },
  table: {
    marginVertical: 20,
    width: "50%",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0,
  },
  tableCell: {
    fontSize: 12,
    padding: 2,
    width: "70%",
  },
  tableCellRight: {
    fontSize: 12,
    padding: 2,
    textAlign: "right",
    width: "30%",
  },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: "#161515",
    marginTop: 10,
  },
  signature: {
    fontSize: 12,
    marginTop: 20,
  },
  attention: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 10,
  },
  listItem: {
    fontSize: 12,
    marginBottom: 8,
    paddingLeft: 10,
  },
  closing: {
    marginTop: 40,
    fontSize: 12,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 35,
    right: 35,
    textAlign: "center",
    fontSize: 10,
    color: "#555",
  },
});

export interface SommatiePDFProps {
  logoUrl: string;
  date: string;
  debtorName: string;
  debtorAddress: string;
  island: string;
  invoice_number: string;
  invoiceAmount: string;
}

const SommatiePDF: React.FC<SommatiePDFProps> = ({
  logoUrl,
  date,
  debtorName,
  debtorAddress,
  island,
  invoice_number,
  invoiceAmount,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={styles.brand}>
          <Image style={styles.logo} src={logoUrl} />
        </View>
        <View style={styles.meta}>
          <Text style={styles.title}>Sommatie tot Ingebrekestelling</Text>
          <Text style={{ fontSize: 12 }}>Verzenddatum: {date}</Text>
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
          Op 9 oktober 2024 ontving u een eerste aanmaning inzake factuurnummer{" "}
          {invoice_number} (USD {invoiceAmount}). Tot op heden hebben wij geen
          betaling of betalingsregeling van u ontvangen.
        </Text>

        <Text style={styles.paragraph}>
          Wij sommeren u hierbij om het volledige bedrag binnen twee (2) dagen
          na dagtekening van deze sommatie over te maken naar MCB-rekeningnummer
          418.825.10, onder vermelding van uw naam, bedrijfsnaam of
          factuurnummer.
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
          • Uw schuld wordt geregistreerd in het Centraal Incassoregister (CI).
        </Text>
        <Text style={styles.listItem}>
          • U wordt geblokkeerd voor buitengerechtelijke handelingen op Bonaire.
        </Text>
        <Text style={styles.listItem}>
          • ABGI kan, na controle van de procedure, formeel opdracht geven tot
          inning.
        </Text>
        <Text style={styles.listItem}>
          • Alle aangesloten deelnemers, waaronder banken en
          overheidsinstanties, zijn verplicht mee te werken aan deze maatregel.
        </Text>

        <Text style={styles.paragraph}>
          Alle kosten die hieruit voortvloeien, komen volledig voor uw rekening.
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
    </Page>
  </Document>
);

export default SommatiePDF;
