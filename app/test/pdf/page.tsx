"use client";
import dynamic from "next/dynamic";
import { InvoicePDF } from "@/templates/pdfs/InvoicePDF";
import AanmaningPDF from "@/templates/pdfs/AanmaningPDF";
import SommatiePDF from "@/templates/pdfs/SommatiePDF";
import IngebrekestellingPDF from "@/templates/pdfs/IngebrekestellingPDF";
import BlokkadePDF from "@/templates/pdfs/BlokkadePDF";

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => <p>Loading PDF viewer...</p>,
  }
);

const InvoiceComponent = () => {
  const params = {
    logoUrl: "/static/logo.png",
    invoice_number: "INV-1001",
    issue_date: "2024-06-15",
    customer_name: "John Doe",
    customer_address: "123 Main St, Springfield",
    customer_island: "Islandia",
    details: [
      {
        item_description: "Product A",
        item_quantity: 2,
        item_unit_price: 50,
        item_tax_rate: 0.1,
        item_subtotal: 110,
      },
      {
        item_description: "Product B",
        item_quantity: 1,
        item_unit_price: 100,
        item_tax_rate: 0.2,
        item_subtotal: 120,
      },
    ],
    total: 230,
    bank_name: "Bank of Examples",
    bank_account: "1234567890",
  };
  return <InvoicePDF {...params} />;
};

const AanmanningComponent = () => {
  const params = {
    logoUrl: "/static/logo.png",
    date: "2024-06-20",
    debtorName: "Jane Smith",
    debtorAddress: "456 Elm St, Springfield",
    island: "Islandia",
    reference_number: "REF-2024-001",
    total_amount: "250.00",
    bankName: "Bank of Examples",
    accountNumber: "1234567890",
    amount_original: "200.00",
    extraCosts: "30.00",
    calculatedABB: "20.00",
    tenantName: "Tenant A",
  };
  return <AanmaningPDF {...params} />;
};

const SommatieComponent = () => {
  const params = {
    logoUrl: "/static/logo.png",
    date: "2024-06-25",
    debtorName: "Alice Johnson",
    debtorAddress: "789 Oak St, Springfield",
    island: "Islandia",
    invoice_number: "INV-1002",
    invoiceAmount: "300.00",
  };
  return <SommatiePDF {...params} />;
};

const IngebrekestellingComponent = () => {
  const params = {
    logoUrl: "/static/logo.png",
    date: "2024-06-30",
    debtorName: "Bob Brown",
    debtorAddress: "321 Pine St, Springfield",
    island: "Islandia",
    firstReminderDate: "2024-07-15",
    secondReminderDate: "2024-07-30",
    accountNumber: "1234567890",
    tenantName: "Tenant B",
  };
  return <IngebrekestellingPDF {...params} />;
};

const BlokkadeComponent = () => {
  const params = {
    logoUrl: "/static/logo.png",
    debtorName: "Charlie Green",
    debtorAddress: "654 Cedar St, Springfield",
    island: "Islandia",
    total_amount: "400.00",
    amountRegister: "350.00",
    total: "450.00",
    bankName: "Bank of Examples",
    accountNumber: "1234567890",
  };
  return <BlokkadePDF {...params} />;
};

export default function PdfPage() {
  return (
    <PDFViewer width="100%" height="1000">
      <BlokkadeComponent />
    </PDFViewer>
  );
}
