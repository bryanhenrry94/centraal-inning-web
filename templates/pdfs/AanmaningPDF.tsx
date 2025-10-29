"use client";
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

export interface AanmaningPDFProps {
  logoUrl: string;
  date: string;
  debtorName: string;
  debtorAddress: string;
  island: string;
  reference_number: string;
  total_amount: string;
  bankName: string;
  accountNumber: string;
  amount_original: string;
  extraCosts: string;
  calculatedABB: string;
  tenantName: string;
}

const AanmaningPDF: React.FC<AanmaningPDFProps> = ({
  logoUrl,
  date,
  debtorName,
  debtorAddress,
  island,
  reference_number,
  total_amount,
  bankName,
  accountNumber,
  amount_original,
  extraCosts,
  calculatedABB,
  tenantName,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brand}>
          <Image style={styles.logo} src={logoUrl} />
        </View>
        <View style={styles.meta}>
          <Text style={styles.title}>Aanmaning</Text>
          <Text style={{ fontSize: 12 }}>Verzenddatum: {date}</Text>
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

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.paragraph}>
          Volgens onze administratie is factuur nr. {reference_number} nog niet
          volledig betaald. Het openstaande bedrag van USD {total_amount} dient
          binnen een termijn van 14 dagen na de datum van deze brief te worden
          voldaan.
        </Text>

        <Text style={styles.paragraph}>
          Wij verzoeken u vriendelijk het verschuldigde bedrag over te maken
          naar rekening {bankName} {accountNumber}, onder vermelding van uw
          naam, bedrijfsnaam, dossiernummer of factuurnummer in de referentie.
        </Text>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Hoofdsom</Text>
            <Text style={styles.tableCellRight}>{amount_original}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Incassokosten 15%</Text>
            <Text style={styles.tableCellRight}>{extraCosts}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>ABB 6%</Text>
            <Text style={styles.tableCellRight}>{calculatedABB}</Text>
          </View>
          <View style={[styles.tableRow, styles.totalRow]}>
            <Text style={styles.tableCell}>Totaalbedrag</Text>
            <Text style={styles.tableCellRight}>{total_amount}</Text>
          </View>
        </View>

        <Text style={styles.paragraph}>
          Wij verzoek u binnen de gestelde termijn te betalen, Indien u het
          bedrag reeds heeft voldaan, kunt u deze aanmaning als niet verzonden
          beschouwen. Voor betaling, het treffen van een regeling of contact met
          de schuldeiser kunt u zich registreren of inloggen via:
          www.centraalinning.com
        </Text>

        <Text style={styles.paragraph}>
          <Text style={{ fontWeight: "bold" }}>Let op:</Text>
          {"\n"}
          Bij uitblijven van betaling wordt USD 93,00 in rekening gebracht en
          kan er een tijdelijke economische blokkade voor de buitengerechtelijke
          fase worden ingesteld. Dit betekent dat uw betalingsachterstand kan
          worden geregistreerd in het centrale betalingssysteem en dat u
          tijdelijk wordt beperkt in uw zakelijke en financiële activiteiten op
          Bonaire, totdat uw schuld volledig is voldaan. Alle bijkomende kosten
          komen volledig voor uw rekening.
        </Text>

        <Text style={styles.paragraph}>Met vriendelijke groet,</Text>

        <View style={styles.signature}>
          <Text>{tenantName}</Text>
          <Text>Schuldeiser</Text>
        </View>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        Dit bericht is automatisch opgesteld en verzonden via het Centraal
        Incassoplatform (CI).
      </Text>
    </Page>
  </Document>
);

export default AanmaningPDF;
