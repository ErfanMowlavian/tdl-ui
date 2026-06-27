import { NextResponse } from "next/server";

import { getSessionService } from "@/lib/sessions/service";
import { namespaceSchema } from "@/lib/sessions/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ sessions: getSessionService().listSessions() });
}

export async function DELETE(request: Request) {
  const namespace = new URL(request.url).searchParams.get("namespace");
  const parsed = namespaceSchema.safeParse(namespace);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid namespace" }, { status: 400 });
  }
  getSessionService().removeSession(parsed.data);
  return NextResponse.json({ ok: true });
}
