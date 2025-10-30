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
  logoUrl: string;
  date: string;
  debtorName: string;
  debtorAddress: string;
  island: string;
  total_amount: string;
  amountRegister: string;
  total: string;
  bankName: string;
  accountNumber: string;
}

// Define styles
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 11,
    paddingLeft: 60,
    paddingTop: 50,
    paddingBottom: 60,
    paddingRight: 60,
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
    fontSize: 11,
    alignItems: "flex-end",
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  billTo: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  client: {
    fontSize: 11,
    lineHeight: 1.4,
    maxWidth: 400,
  },
  content: {
    marginTop: 40,
  },
  paragraph: {
    fontSize: 11,
    lineHeight: 1.4,
    textAlign: "justify",
    marginBottom: 15,
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
    fontSize: 11,
    padding: 2,
    width: "70%",
  },
  tableCellRight: {
    fontSize: 11,
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
    fontSize: 11,
    marginTop: 20,
  },
  strongText: {
    fontWeight: "bold",
  },
  attention: {
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 10,
  },
  listItem: {
    fontSize: 11,
    marginBottom: 8,
    paddingLeft: 10,
  },
  closing: {
    marginTop: 40,
    fontSize: 11,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 35,
    right: 35,
    textAlign: "center",
    fontSize: 11,
    color: "#555",
  },
});

const BlokkadePDF: React.FC<BlokkadePDFProps> = ({
  logoUrl,
  date,
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
            <Image style={styles.logo} src={logoUrl} />
          </View>
          <View style={styles.meta}>
            <Text style={styles.title}>Financiële Blokkade</Text>
            <Text style={{ fontSize: 11 }}>Verzenddatum: {date}</Text>
          </View>
        </View>

        {/* Bill To Section */}
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
