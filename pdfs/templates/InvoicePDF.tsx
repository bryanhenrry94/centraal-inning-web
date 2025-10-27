import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

interface InvoicePDFProps {
  name: string;
  amount: number;
}

const styles = StyleSheet.create({
  page: { padding: 30 },
  section: { marginBottom: 10 },
});

export const InvoicePDF: React.FC<InvoicePDFProps> = ({ name, amount }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text>Nombre: {name}</Text>
        <Text>Monto: ${amount}</Text>
      </View>
    </Page>
  </Document>
);
