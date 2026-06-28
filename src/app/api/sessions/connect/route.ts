import { NextResponse } from "next/server";

import { getSessionService } from "@/lib/sessions/service";
import { namespaceSchema } from "@/lib/sessions/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = namespaceSchema.safeParse(
    (body as { namespace?: unknown })?.namespace,
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid namespace" },
      { status: 400 },
    );
  }

  const result = await getSessionService().connectExisting(parsed.data);
  return NextResponse.json(result, { status: result.ok ? 200 : 422 });
}
