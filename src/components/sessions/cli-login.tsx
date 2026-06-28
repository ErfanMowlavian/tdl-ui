"use client";

import * as React from "react";
import { toast } from "sonner";

import type { DesktopLoginResult } from "@/lib/sessions/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CliLogin({ onConnected }: { onConnected: () => void }) {
  const [namespace, setNamespace] = React.useState("default");
  const [submitting, setSubmitting] = React.useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/sessions/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ namespace }),
      });
      const data = (await res.json()) as DesktopLoginResult & {
        error?: string;
      };
      if (res.ok && data.ok) {
        toast.success(`Connected session "${namespace}"`);
        onConnected();
      } else {
        toast.error(data.error ?? "Could not connect that session");
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
        tdl&apos;s login is interactive, so run it once in your terminal, then
        connect it here:
      </p>
      <pre className="bg-muted overflow-x-auto rounded-md p-3 text-xs">
        <code>tdl login -n {namespace || "default"}</code>
      </pre>
      <p className="text-muted-foreground text-sm">
        Follow the prompts (QR or desktop), then enter the same session name
        below and connect.
      </p>

      <div className="grid gap-2">
        <Label htmlFor="cli-namespace">Session name</Label>
        <Input
          id="cli-namespace"
          value={namespace}
          onChange={(e) => setNamespace(e.target.value)}
          placeholder="default"
          autoComplete="off"
          required
        />
      </div>

      <Button type="submit" disabled={submitting} className="w-fit">
        {submitting ? "Connecting…" : "Connect session"}
      </Button>
    </form>
  );
}
