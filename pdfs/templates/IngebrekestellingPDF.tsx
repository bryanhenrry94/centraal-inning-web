import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

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
  metaTitle: {
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

export interface IngebrekestellingProps {
  logoUrl: string;
  date: string;
  debtorName: string;
  debtorAddress: string;
  island: string;
  firstReminderDate: string;
  secondReminderDate: string;
  accountNumber: string;
  tenantName: string;
}

const IngebrekestellingPDF: React.FC<IngebrekestellingProps> = ({
  logoUrl,
  date,
  debtorName,
  debtorAddress,
  island,
  firstReminderDate,
  secondReminderDate,
  accountNumber,
  tenantName,
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <Image style={styles.logo} src={logoUrl} />
          </View>
          <View style={styles.meta}>
            <Text style={styles.metaTitle}>Ingebrekestelling</Text>
            <Text style={{ fontSize: 12 }}>Verzenddatum: {date}</Text>
          </View>
        </View>

        <View style={styles.billTo}>
          <View style={styles.client}>
            <Text>
              <Text style={{ fontWeight: "bold" }}>Aan:</Text> {debtorName}
            </Text>
            <Text>{debtorAddress}</Text>
            <Text>{island}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.paragraph}>
            Op {firstReminderDate} en {secondReminderDate} hebben wij u
            aangemaand om uw openstaande factuur te voldoen. Tot op heden is
            geen volledige betaling ontvangen.
          </Text>

          <Text style={styles.paragraph}>
            Bij deze stellen wij u formeel in gebreke en sommeren wij u tot
            onmiddellijke betaling van het openstaande bedrag op
            MCB-rekeningnummer {accountNumber}, onder vermelding van uw naam,
            bedrijfsnaam of factuurnummer.
          </Text>

          <Text style={styles.paragraph}>
            Er zullen verdere invorderingsmaatregelen tegen u worden genomen en
            alle bijkomende kosten komen volledig voor uw rekening.
          </Text>

          <Text style={styles.paragraph}>Met vriendelijke groet,</Text>

          <View style={styles.signature}>
            <Text>{tenantName}</Text>
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
