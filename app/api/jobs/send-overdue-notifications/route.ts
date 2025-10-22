import { NextResponse } from "next/server";
import { sendOverdueNotifications } from "@/lib/jobs/sendOverdueNotifications";

export async function GET() {
  try {
    const result = await sendOverdueNotifications();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
