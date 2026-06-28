import { NextResponse } from "next/server";

import { getChatService } from "@/lib/chats/service";
import { namespaceSchema } from "@/lib/sessions/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const namespace = new URL(request.url).searchParams.get("namespace");
  const parsed = namespaceSchema.safeParse(namespace);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid namespace" }, { status: 400 });
  }

  const chats = await getChatService().listChats(parsed.data);
  return NextResponse.json({ chats });
}
