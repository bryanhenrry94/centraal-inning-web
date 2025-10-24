import { NextResponse } from "next/server";
import { processCollectionCaseWorkflow } from "@/lib/jobs/process_collection_case_workflow";

export async function GET() {
  try {
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
