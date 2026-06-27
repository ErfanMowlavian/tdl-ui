import { getJobManager } from "@/lib/jobs/manager";
import type { JobEvent } from "@/lib/tdl/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HEARTBEAT_MS = 15000;

/**
 * Server-Sent Events stream of job activity. Sends an initial snapshot of all
 * jobs, then live `created` / `progress` / `status` / `log` events as they
 * happen. Heartbeats keep proxies from closing an idle connection.
 */
export async function GET(request: Request) {
  const manager = getJobManager();
  const encoder = new TextEncoder();

  let unsubscribe = () => {};
  let heartbeat: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream({
    start(controller) {
      const write = (chunk: string) => {
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          // Stream already closed; ignore.
        }
      };

      const send = (event: JobEvent) =>
        write(`data: ${JSON.stringify(event)}\n\n`);

      write(`event: snapshot\ndata: ${JSON.stringify(manager.list())}\n\n`);

      unsubscribe = manager.subscribe(send);
      heartbeat = setInterval(() => write(": ping\n\n"), HEARTBEAT_MS);

      request.signal.addEventListener("abort", () => {
        if (heartbeat) clearInterval(heartbeat);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // Already closed.
        }
      });
    },
    cancel() {
      if (heartbeat) clearInterval(heartbeat);
      unsubscribe();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
