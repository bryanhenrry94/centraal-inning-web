import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

export interface IngebrekestellingData {
  date: string;
  debtorName: string;
  debtorAddress: string;
  island: string;
  firstReminderDate: string;
  secondReminderDate: string;
  accountNumber: string;
  tenantName: string;
}

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 12,
    color: "#222",
    padding: 18,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  brand: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 125,
    marginLeft: -55,
    marginTop: -40,
  },
  meta: {
    textAlign: "right",
    fontSize: 16,
    lineHeight: 1.3,
    marginTop: -60,
  },
  metaTitle: {
    fontWeight: "bold",
    fontSize: 20,
  },
  billTo: {
    marginTop: 36,
    marginBottom: 42,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
  },
  client: {
    fontSize: 14,
    lineHeight: 1.4,
    maxWidth: 400,
  },
  content: {
    marginTop: 80,
  },
  paragraph: {
    textAlign: "justify",
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 1.4,
  },
  signature: {
    fontSize: 16,
    marginTop: 40,
  },
  footer: {
    marginTop: 26,
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    paddingTop: 8,
    position: "absolute",
    bottom: 30,
    left: 18,
    right: 18,
  },
});

interface IngebrekestellingProps {
  data: IngebrekestellingData;
}

const IngebrekestellingPDF: React.FC<IngebrekestellingProps> = ({ data }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <Image
              style={styles.logo}
              src="https://dazzsoft.com/wp-content/uploads/2025/09/LogoCIO.png"
            />
          </View>
          <View style={styles.meta}>
            <Text style={styles.metaTitle}>Ingebrekestelling</Text>
            <Text>Verzenddatum: {data.date}</Text>
          </View>
        </View>

        <View style={styles.billTo}>
          <View style={styles.client}>
            <Text>
              <Text style={{ fontWeight: "bold" }}>Aan:</Text> {data.debtorName}
            </Text>
            <Text>{data.debtorAddress}</Text>
            <Text>{data.island}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.paragraph}>
            Op {data.firstReminderDate} en {data.secondReminderDate} hebben wij
            u aangemaand om uw openstaande factuur te voldoen. Tot op heden is
            geen volledige betaling ontvangen.
          </Text>

          <Text style={styles.paragraph}>
            Bij deze stellen wij u formeel in gebreke en sommeren wij u tot
            onmiddellijke betaling van het openstaande bedrag op
            MCB-rekeningnummer {data.accountNumber}, onder vermelding van uw
            naam, bedrijfsnaam of factuurnummer.
          </Text>

          <Text style={styles.paragraph}>
            Er zullen verdere invorderingsmaatregelen tegen u worden genomen en
            alle bijkomende kosten komen volledig voor uw rekening.
          </Text>

          <Text style={styles.paragraph}>Met vriendelijke groet,</Text>

          <View style={styles.signature}>
            <Text>{data.tenantName}</Text>
            <Text>Schuldeiser</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>
            Dit bericht is automatisch opgesteld en verzonden via het Centraal
            Incassoplatform (CI).
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default IngebrekestellingPDF;
