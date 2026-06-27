"use client";

import * as React from "react";
import { toast } from "sonner";

import type { DesktopLoginResult } from "@/lib/sessions/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DesktopLogin({ onConnected }: { onConnected: () => void }) {
  const [namespace, setNamespace] = React.useState("default");
  const [desktopPath, setDesktopPath] = React.useState("");
  const [passcode, setPasscode] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/sessions/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "desktop",
          namespace,
          desktopPath: desktopPath.trim() || undefined,
          passcode: passcode || undefined,
        }),
      });
      const data = (await res.json()) as DesktopLoginResult & {
        error?: string;
      };
      if (res.ok && data.ok) {
        toast.success(`Connected session "${namespace}"`);
        setPasscode("");
        onConnected();
      } else {
        toast.error(data.error ?? "Desktop import failed");
      }
    } catch {
      toast.error("Could not reach the server");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm">
        Import an existing <span className="font-medium">Telegram Desktop</span>{" "}
        session from this machine. Leave the path empty to let tdl auto-detect
        it.
      </p>

      <div className="grid gap-2">
        <Label htmlFor="desktop-namespace">Session name</Label>
        <Input
          id="desktop-namespace"
          value={namespace}
          onChange={(e) => setNamespace(e.target.value)}
          placeholder="default"
          autoComplete="off"
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="desktop-path">
          Telegram Desktop path{" "}
          <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="desktop-path"
          value={desktopPath}
          onChange={(e) => setDesktopPath(e.target.value)}
          placeholder="auto-detect"
          autoComplete="off"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="desktop-passcode">
          Local passcode{" "}
          <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="desktop-passcode"
          type="password"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="if your desktop client has one"
          autoComplete="off"
        />
      </div>

      <Button type="submit" disabled={submitting} className="w-fit">
        {submitting ? "Importing…" : "Import session"}
      </Button>
    </form>
  );
}
