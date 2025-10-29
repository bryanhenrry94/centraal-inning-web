import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

export interface InvoiceItem {
  item_description: string;
  item_quantity: number;
  item_unit_price: number;
  item_tax_rate: number;
  item_subtotal: number;
}

export interface InvoicePDFProps {
  logoUrl: string;
  invoice_number: string;
  issue_date: string;
  customer_name: string;
  customer_address: string;
  customer_island: string;
  details: InvoiceItem[];
  total: number;
  bank_name: string;
  bank_account: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#222",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    fontSize: 12,
    lineHeight: 1.3,
    alignItems: "flex-end",
    minWidth: 200,
  },
  metaTitle: {
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
    maxWidth: 200,
  },
  table: {
    marginTop: 32,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    padding: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#efefef",
    padding: 8,
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
  },
  tableCellCenter: {
    flex: 1,
    fontSize: 10,
    textAlign: "center",
  },
  tableCellRight: {
    flex: 1,
    fontSize: 10,
    textAlign: "right",
  },
  description: {
    flex: 2,
    fontSize: 10,
  },
  totals: {
    marginTop: 32,
    alignItems: "flex-end",
  },
  totalsBox: {
    width: 200,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#eaeaea",
    paddingTop: 6,
    paddingHorizontal: 8,
  },
  footer: {
    marginTop: 32,
    fontSize: 10,
    color: "#555",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 8,
    textAlign: "justify",
  },
});

export const InvoicePDF: React.FC<InvoicePDFProps> = ({
  logoUrl,
  invoice_number,
  issue_date,
  customer_name,
  customer_address,
  customer_island,
  details,
  total,
  bank_name,
  bank_account,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brand}>
          <Image style={styles.logo} src={logoUrl} />
        </View>
        <View style={styles.meta}>
          <Text style={styles.metaTitle}>FACTUUR</Text>
          <Text>
            Factuurnummer:{" "}
            <Text style={{ fontWeight: "bold" }}>{invoice_number}</Text>
          </Text>
          <Text>
            Factuurdatum:{" "}
            <Text style={{ fontWeight: "bold" }}>{issue_date}</Text>
          </Text>
        </View>
      </View>

      {/* Bill To */}
      <View style={styles.billTo}>
        <View style={styles.client}>
          <Text style={{ fontWeight: "bold" }}>Aan:</Text>
          <Text>{customer_name}</Text>
          <Text>{customer_address}</Text>
          <Text>{customer_island}</Text>
        </View>
      </View>

      {/* Items Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.description}>Beschrijving</Text>
          <Text style={styles.tableCellCenter}>Aantal</Text>
          <Text style={styles.tableCellCenter}>Prijs per stuk</Text>
          <Text style={styles.tableCellCenter}>ABB 6%</Text>
          <Text style={styles.tableCellCenter}>Subtotaal</Text>
        </View>
        {details.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.description}>{item.item_description}</Text>
            <Text style={styles.tableCellCenter}>{item.item_quantity}</Text>
            <Text style={styles.tableCellRight}>${item.item_unit_price}</Text>
            <Text style={styles.tableCellRight}>${item.item_tax_rate}</Text>
            <Text style={styles.tableCellRight}>${item.item_subtotal}</Text>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={styles.totals}>
        <View style={styles.totalsBox}>
          <View style={styles.totalRow}>
            <Text style={{ fontWeight: "bold" }}>Te betalen:</Text>
            <Text style={{ fontWeight: "bold" }}>${total}</Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>
          Wij verzoeken u vriendelijk om het factuurbedrag binnen 30 dagen na
          factuurdatum over te maken naar bankrekening {bank_name}{" "}
          {bank_account} onder vermelding van het factuurnummer. Deze factuur is
          automatisch aangemaakt door ons systeem CI.
        </Text>
      </View>
    </Page>
  </Document>
);
