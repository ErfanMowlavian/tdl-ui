import { z } from "zod";
import { NextResponse } from "next/server";

import { getChatService } from "@/lib/chats/service";
import { namespaceSchema } from "@/lib/sessions/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const exportSchema = z.object({
  namespace: namespaceSchema,
  chatId: z.string().min(1, "chatId is required"),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = exportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  const job = getChatService().startExport(
    parsed.data.namespace,
    parsed.data.chatId,
  );
  return NextResponse.json(job, { status: 201 });
}
