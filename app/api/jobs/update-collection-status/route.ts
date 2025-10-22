import { NextResponse } from "next/server";
import { updateCollectionStatus } from "@/lib/jobs/updateCollectionStatus";

export async function GET() {
  try {
    const result = await updateCollectionStatus();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
