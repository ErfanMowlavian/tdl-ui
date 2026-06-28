import { NextResponse } from "next/server";

import { getJobManager } from "@/lib/jobs/manager";
import { buildForwardArgs, forwardSchema } from "@/lib/forwards/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = forwardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const args = buildForwardArgs(input);

  const job = getJobManager().create({
    kind: "forward",
    title: `Forward ${input.from.length} message(s)`,
    args,
    namespace: input.namespace,
  });

  return NextResponse.json(job);
}
