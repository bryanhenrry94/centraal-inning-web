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
  return (
    <PDFViewer width="100%" height="1000">
      <InvoicePDF name="Bryan" amount={230} />
    </PDFViewer>
  );
}
