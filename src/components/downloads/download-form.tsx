"use client";

import * as React from "react";
import { toast } from "sonner";

import type { SessionInfo } from "@/lib/sessions/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface DownloadFormProps {
  initialSessions: SessionInfo[];
}

export function DownloadForm({ initialSessions }: DownloadFormProps) {
  const [selectedNamespace, setSelectedNamespace] = React.useState<string>("");
  const [urls, setUrls] = React.useState<string>("");
  const [dir, setDir] = React.useState<string>("");
  const [threads, setThreads] = React.useState<string>("");
  const [limit, setLimit] = React.useState<string>("");
  const [include, setInclude] = React.useState<string>("");
  const [exclude, setExclude] = React.useState<string>("");
  const [group, setGroup] = React.useState(false);
  const [skipSame, setSkipSame] = React.useState(false);
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    const urlLines = urls
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (urlLines.length === 0) {
      toast.error("At least one message link is required");
      return;
    }

    if (!selectedNamespace) {
      toast.error("Please select a session");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          namespace: selectedNamespace,
          urls: urlLines,
          dir: dir || undefined,
          threads: threads ? parseInt(threads, 10) : undefined,
          limit: limit ? parseInt(limit, 10) : undefined,
          include: include || undefined,
          exclude: exclude || undefined,
          group,
          skipSame,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Failed to create download job");
        return;
      }

      const job = await response.json();
      toast.success(`Download job created: ${job.title}`);

      setUrls("");
      setDir("");
      setThreads("");
      setLimit("");
      setInclude("");
      setExclude("");
      setGroup(false);
      setSkipSame(false);
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
              <Label htmlFor="urls">Message links (one per line)</Label>
              <textarea
                id="urls"
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
                placeholder="https://t.me/channel/123"
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-ring min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dir">Output directory (optional)</Label>
              <Input
                id="dir"
                value={dir}
                onChange={(e) => setDir(e.target.value)}
                placeholder="/path/to/output"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="threads">Threads (1-16, optional)</Label>
              <Input
                id="threads"
                type="number"
                value={threads}
                onChange={(e) => setThreads(e.target.value)}
                placeholder="8"
                min="1"
                max="16"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="limit">Parallel tasks (1-8, optional)</Label>
              <Input
                id="limit"
                type="number"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder="4"
                min="1"
                max="8"
              />
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-fit"
            >
              {showAdvanced ? "Hide" : "Show"} advanced options
            </Button>

            {showAdvanced && (
              <div className="space-y-3 rounded-md border p-4">
                <div className="grid gap-2">
                  <Label htmlFor="include">
                    Include extensions (comma-separated, optional)
                  </Label>
                  <Input
                    id="include"
                    value={include}
                    onChange={(e) => setInclude(e.target.value)}
                    placeholder="jpg, png, gif"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="exclude">
                    Exclude extensions (comma-separated, optional)
                  </Label>
                  <Input
                    id="exclude"
                    value={exclude}
                    onChange={(e) => setExclude(e.target.value)}
                    placeholder="pdf, docx"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="group"
                    type="checkbox"
                    checked={group}
                    onChange={(e) => setGroup(e.target.checked)}
                    className="border-input accent-primary size-4 rounded border"
                  />
                  <Label htmlFor="group">Group albums</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="skipSame"
                    type="checkbox"
                    checked={skipSame}
                    onChange={(e) => setSkipSame(e.target.checked)}
                    className="border-input accent-primary size-4 rounded border"
                  />
                  <Label htmlFor="skipSame">Skip same files</Label>
                </div>
              </div>
            )}

            <Button type="submit" disabled={submitting} className="w-fit">
              {submitting ? "Starting download..." : "Start download"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
