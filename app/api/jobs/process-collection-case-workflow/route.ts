import { NextRequest, NextResponse } from "next/server";
import { processCollectionCaseWorkflow } from "@/lib/jobs/process_collection_case_workflow";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");

    if (token !== process.env.CRON_SECRET_TOKEN) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const result = await processCollectionCaseWorkflow();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
