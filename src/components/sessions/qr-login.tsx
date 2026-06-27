"use client";

import * as React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import type { QrLoginEvent, QrLoginStatus } from "@/lib/sessions/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Phase = "idle" | QrLoginStatus;

export function QrLogin({ onConnected }: { onConnected: () => void }) {
  const [namespace, setNamespace] = React.useState("default");
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [qrUrl, setQrUrl] = React.useState<string | null>(null);
  const sourceRef = React.useRef<EventSource | null>(null);

  const closeStream = React.useCallback(() => {
    sourceRef.current?.close();
    sourceRef.current = null;
  }, []);

  // Close the stream if the component unmounts mid-login.
  React.useEffect(() => closeStream, [closeStream]);

  const handleEvent = React.useCallback(
    (event: QrLoginEvent) => {
      if (event.type !== "state") return;
      setPhase(event.state.status);
      setQrUrl(event.state.qrUrl);
      if (event.state.status === "connected") {
        closeStream();
        toast.success(`Connected session "${namespace}"`);
        onConnected();
      } else if (event.state.status === "failed") {
        closeStream();
        toast.error(event.state.error ?? "QR login failed");
      }
    },
    [closeStream, namespace, onConnected],
  );

  const start = async () => {
    setPhase("starting");
    setQrUrl(null);
    try {
      const res = await fetch("/api/sessions/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: "qr", namespace }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        setPhase("failed");
        toast.error(data.error ?? "Could not start QR login");
        return;
      }

      const source = new EventSource(
        `/api/sessions/login/stream?namespace=${encodeURIComponent(namespace)}`,
      );
      source.onmessage = (message) => {
        try {
          handleEvent(JSON.parse(message.data) as QrLoginEvent);
        } catch {
          // Ignore malformed events.
        }
      };
      source.onerror = () => closeStream();
      sourceRef.current = source;
    } catch {
      setPhase("failed");
      toast.error("Could not reach the server");
    }
  };

  const cancel = async () => {
    closeStream();
    setPhase("idle");
    setQrUrl(null);
    await fetch(
      `/api/sessions/login?namespace=${encodeURIComponent(namespace)}`,
      { method: "DELETE" },
    ).catch(() => {});
  };

  const inProgress =
    phase === "starting" || phase === "waiting" || phase === "connected";

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm">
        Generate a QR code, then scan it in Telegram under{" "}
        <span className="font-medium">
          Settings → Devices → Link Desktop Device
        </span>
        .
      </p>

      <div className="grid gap-2">
        <Label htmlFor="qr-namespace">Session name</Label>
        <Input
          id="qr-namespace"
          value={namespace}
          onChange={(e) => setNamespace(e.target.value)}
          placeholder="default"
          autoComplete="off"
          disabled={inProgress}
        />
      </div>

      {phase === "idle" || phase === "failed" || phase === "canceled" ? (
        <Button onClick={() => void start()} className="w-fit">
          Generate QR code
        </Button>
      ) : (
        <div className="flex flex-col items-start gap-4">
          <div className="bg-background flex size-48 items-center justify-center rounded-lg border p-3">
            {qrUrl ? (
              <QRCodeSVG value={qrUrl} className="h-full w-full" />
            ) : (
              <Loader2Icon className="text-muted-foreground size-6 animate-spin" />
            )}
          </div>
          <p className="text-muted-foreground flex items-center gap-2 text-sm">
            <Loader2Icon className="size-3.5 animate-spin" />
            {qrUrl ? "Waiting for you to scan…" : "Generating QR code…"}
          </p>
          <Button variant="outline" size="sm" onClick={() => void cancel()}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
