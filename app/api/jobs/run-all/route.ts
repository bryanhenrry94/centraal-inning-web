import { NextResponse } from "next/server";
import { updateCollectionStatus } from "@/lib/jobs/updateCollectionStatus";
import { sendOverdueNotifications } from "@/lib/jobs/sendOverdueNotifications";

export async function GET() {
  try {
    const statusResult = await updateCollectionStatus();
    const notifResult = await sendOverdueNotifications();

    return NextResponse.json({
      success: true,
      message: "Todos los procesos ejecutados correctamente",
      stats: {
        updated: statusResult.count,
        notified: notifResult.sent,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
