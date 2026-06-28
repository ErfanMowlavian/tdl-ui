"use client";

import * as React from "react";
import { toast } from "sonner";

import type { SessionInfo } from "@/lib/sessions/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface ForwardFormProps {
  initialSessions: SessionInfo[];
}

export function ForwardForm({ initialSessions }: ForwardFormProps) {
  const [selectedNamespace, setSelectedNamespace] = React.useState<string>("");
  const [from, setFrom] = React.useState<string>("");
  const [to, setTo] = React.useState<string>("");
  const [silent, setSilent] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    const fromLines = from
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (fromLines.length === 0) {
      toast.error("At least one source link is required");
      return;
    }

    if (!selectedNamespace) {
      toast.error("Please select a session");
      return;
    }

    if (!to.trim()) {
      toast.error("Destination chat is required");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/forwards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          namespace: selectedNamespace,
          from: fromLines,
          to: to.trim(),
          silent,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Failed to create forward job");
        return;
      }

      const job = await response.json();
      toast.success(`Forward job created: ${job.title}`);

      setFrom("");
      setTo("");
      setSilent(false);
    } catch {
      toast.error("Could not reach the server");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="namespace-select">Session</Label>
              <select
                id="namespace-select"
                value={selectedNamespace}
                onChange={(e) => setSelectedNamespace(e.target.value)}
                className="border-input bg-background ring-offset-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
                required
              >
                <option value="">Select a session...</option>
                {initialSessions.map((session) => (
                  <option key={session.namespace} value={session.namespace}>
                    {session.namespace}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="from">Source links (one per line)</Label>
              <textarea
                id="from"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="https://t.me/channel/123"
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-ring min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="to">Destination chat</Label>
              <Input
                id="to"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="username or chat ID"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="silent"
                type="checkbox"
                checked={silent}
                onChange={(e) => setSilent(e.target.checked)}
                className="border-input accent-primary size-4 rounded border"
              />
              <Label htmlFor="silent">Silent (do not notify members)</Label>
            </div>

            <Button type="submit" disabled={submitting} className="w-fit">
              {submitting ? "Starting forward..." : "Start forward"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
