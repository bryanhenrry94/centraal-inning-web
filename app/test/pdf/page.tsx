"use client";
import dynamic from "next/dynamic";
import { InvoicePDF } from "@/pdfs/templates/InvoicePDF";

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => <p>Loading PDF viewer...</p>,
  }
);

export default function Page() {
  const params = {
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
  return (
    <PDFViewer width="100%" height="1000">
      <InvoicePDF {...params} />
    </PDFViewer>
  );
}
