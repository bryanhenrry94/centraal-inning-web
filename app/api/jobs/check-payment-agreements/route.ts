import { NextResponse } from "next/server";
import { checkPaymentAgreements } from "@/lib/jobs/checkPaymentAgreements";

export async function GET() {
  try {
    const result = await checkPaymentAgreements();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Error en check-payment-agreements:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
