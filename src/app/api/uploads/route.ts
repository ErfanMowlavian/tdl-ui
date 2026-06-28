import { NextResponse } from "next/server";

import { getJobManager } from "@/lib/jobs/manager";
import { buildUploadArgs, uploadSchema } from "@/lib/uploads/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = uploadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const args = buildUploadArgs(input);

  const job = getJobManager().create({
    kind: "upload",
    title: `Upload ${input.paths.length} file(s)`,
    args,
    namespace: input.namespace,
  });

  return NextResponse.json(job);
}
