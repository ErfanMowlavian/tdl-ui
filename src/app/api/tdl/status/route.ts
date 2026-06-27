import { NextResponse } from "next/server";

import { getAdapter } from "@/lib/tdl/adapter";
import type { TdlInfo } from "@/lib/tdl/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const info: TdlInfo = await getAdapter().detect();
  return NextResponse.json(info);
}
