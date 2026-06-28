import { NextResponse } from "next/server";

import { getJobManager } from "@/lib/jobs/manager";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const canceled = getJobManager().cancel(id);
  return NextResponse.json({ canceled });
}
