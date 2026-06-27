import { NextResponse } from "next/server";

import { getSessionService } from "@/lib/sessions/service";
import { loginSchema, namespaceSchema } from "@/lib/sessions/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  const service = getSessionService();
  const input = parsed.data;

  if (input.method === "qr") {
    const state = service.startQrLogin(input.namespace);
    return NextResponse.json({ state });
  }

  const result = await service.loginDesktop({
    namespace: input.namespace,
    desktopPath: input.desktopPath,
    passcode: input.passcode,
  });
  return NextResponse.json(result, { status: result.ok ? 200 : 422 });
}

export function DELETE(request: Request) {
  const namespace = new URL(request.url).searchParams.get("namespace");
  const parsed = namespaceSchema.safeParse(namespace);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid namespace" }, { status: 400 });
  }
  const canceled = getSessionService().cancelQrLogin(parsed.data);
  return NextResponse.json({ canceled });
}
