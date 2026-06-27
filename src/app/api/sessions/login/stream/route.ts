import { getSessionService } from "@/lib/sessions/service";
import { namespaceSchema } from "@/lib/sessions/validation";
import type { QrLoginEvent } from "@/lib/sessions/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HEARTBEAT_MS = 15000;

/** SSE stream of a QR login's state and log lines for one namespace. */
export function GET(request: Request) {
  const namespace = new URL(request.url).searchParams.get("namespace");
  const parsed = namespaceSchema.safeParse(namespace);
  if (!parsed.success) {
    return new Response("Invalid namespace", { status: 400 });
  }

  const service = getSessionService();
  const ns = parsed.data;
  const encoder = new TextEncoder();

  let unsubscribe = () => {};
  let heartbeat: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream({
    start(controller) {
      const write = (chunk: string) => {
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          // Stream already closed.
        }
      };
      const send = (event: QrLoginEvent) =>
        write(`data: ${JSON.stringify(event)}\n\n`);

      const current = service.getQrState(ns);
      if (current) send({ type: "state", state: current });

      unsubscribe = service.subscribeQr(ns, send);
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
