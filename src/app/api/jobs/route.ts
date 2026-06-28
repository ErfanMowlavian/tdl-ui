import { NextResponse } from "next/server";

import { getJobManager } from "@/lib/jobs/manager";
import { buildDownloadArgs, downloadSchema } from "@/lib/downloads/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const jobs = getJobManager().list();
  return NextResponse.json({ jobs });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = downloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const args = buildDownloadArgs(input);

  const job = getJobManager().create({
    kind: "download",
    title: `Download ${input.urls.length} item(s)`,
    args,
    namespace: input.namespace,
  });

  return NextResponse.json(job);
}
