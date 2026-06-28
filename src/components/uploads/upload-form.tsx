"use client";

import * as React from "react";
import { toast } from "sonner";

import type { SessionInfo } from "@/lib/sessions/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface UploadFormProps {
  initialSessions: SessionInfo[];
}

export function UploadForm({ initialSessions }: UploadFormProps) {
  const [selectedNamespace, setSelectedNamespace] = React.useState<string>("");
  const [paths, setPaths] = React.useState<string>("");
  const [chat, setChat] = React.useState<string>("");
  const [removeAfter, setRemoveAfter] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    const pathLines = paths
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (pathLines.length === 0) {
      toast.error("At least one file path is required");
      return;
    }

    if (!selectedNamespace) {
      toast.error("Please select a session");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/uploads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          namespace: selectedNamespace,
          paths: pathLines,
          chat: chat || undefined,
          removeAfter,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Failed to create upload job");
        return;
      }

      const job = await response.json();
      toast.success(`Upload job created: ${job.title}`);

      setPaths("");
      setChat("");
      setRemoveAfter(false);
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
              <Label htmlFor="paths">File paths (one per line)</Label>
              <textarea
                id="paths"
                value={paths}
                onChange={(e) => setPaths(e.target.value)}
                placeholder="/path/to/file1.jpg"
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-ring min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="chat">Target chat (optional)</Label>
              <Input
                id="chat"
                value={chat}
                onChange={(e) => setChat(e.target.value)}
                placeholder="username or chat ID"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="removeAfter"
                type="checkbox"
                checked={removeAfter}
                onChange={(e) => setRemoveAfter(e.target.checked)}
                className="border-input accent-primary size-4 rounded border"
              />
              <Label htmlFor="removeAfter">Remove files after upload</Label>
            </div>

            <Button type="submit" disabled={submitting} className="w-fit">
              {submitting ? "Starting upload..." : "Start upload"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
