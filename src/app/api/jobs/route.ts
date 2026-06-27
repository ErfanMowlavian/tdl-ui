import { NextResponse } from "next/server";

import { getJobManager } from "@/lib/jobs/manager";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const jobs = getJobManager().list();
  return NextResponse.json({ jobs });
}
