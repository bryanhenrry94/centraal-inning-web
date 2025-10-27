import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

export interface BlokkadePDFProps {
  debtorName: string;
  debtorAddress: string;
  island: string;
  total_amount: string;
  amountRegister: string;
  total: string;
  bankName: string;
  accountNumber: string;
}

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 12,
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  logo: {
    width: 200,
    height: 125,
    marginLeft: -20,
    marginTop: -15,
  },
  meta: {
    textAlign: "right",
    fontSize: 16,
    marginTop: -30,
  },
  metaTitle: {
    fontWeight: "bold",
    fontSize: 18,
  },
  billTo: {
    marginTop: 50,
    marginBottom: 40,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  client: {
    fontSize: 14,
    lineHeight: 1.4,
    maxWidth: 200,
  },
  summary: {
    fontSize: 14,
    lineHeight: 1.4,
    maxWidth: 200,
  },
  content: {
    marginTop: 40,
  },
  paragraph: {
    textAlign: "justify",
    fontSize: 14,
    lineHeight: 1.5,
    marginBottom: 15,
  },
  strongText: {
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 35,
    right: 35,
    textAlign: "center",
    fontSize: 12,
    color: "#555",
  },
});

const BlokkadePDF: React.FC<BlokkadePDFProps> = ({
  debtorName,
  debtorAddress,
  island,
  total_amount,
  amountRegister,
  total,
  bankName,
  accountNumber,
}) => {
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
            <Text style={styles.metaTitle}>Financiële{"\n"}Blokkade</Text>
          </View>
        </View>

        <View style={styles.billTo}>
          <View style={styles.client}>
            <Text style={styles.strongText}>Aan:</Text>
            <Text>{debtorName}</Text>
            <Text>{debtorAddress}</Text>
            <Text>{island}</Text>
          </View>
          <View style={styles.summary}>{/* Summary content if needed */}</View>
        </View>

        <View style={styles.content}>
          <Text style={styles.paragraph}>
            Uw schuldeiser, Rico Aceme, heeft u conform de wettelijke vereisten
            voor de buitengerechtelijke fase aangemaand. U bent hierbij formeel
            in gebreke gesteld.
          </Text>

          <Text style={styles.paragraph}>
            Uw openstaande vordering van {total_amount} is geregistreerd in het
            Centraal Incassoregister (CI). Als gevolg hiervan is er een
            financiële blokkade opgelegd voor de buitengerechtelijke fase.
          </Text>

          <Text style={styles.paragraph}>
            Voor deze registratie bent u een bedrag van {amountRegister}{" "}
            verschuldigd, bovenop uw openstaande vordering. Het totaal te
            betalen bedrag bedraagt {total}.
          </Text>

          <Text style={styles.paragraph}>
            Wij verzoeken u dit bedrag onmiddellijk en volledig over te maken
            naar {bankName}-rekeningnummer
            {accountNumber}, onder vermelding van uw naam, bedrijfsnaam of
            factuurnummer.
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.strongText}>Let op:</Text>
            {"\n"}
            De financiële blokkade kan uitsluitend worden opgeheven door
            volledige betaling, het treffen van een betalingsregeling, of via
            een gerechtelijk bevel.
          </Text>
        </View>

        <Text style={styles.footer}>
          Dit bericht is automatisch opgemaakt en daarom niet ondertekend.
        </Text>
      </Page>
    </Document>
  );
};

export default BlokkadePDF;
