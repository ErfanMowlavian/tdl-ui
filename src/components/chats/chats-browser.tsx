"use client";

import * as React from "react";
import { FileDownIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import type { Chat } from "@/lib/chats/types";
import type { SessionInfo } from "@/lib/sessions/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface ChatsBrowserProps {
  initialSessions: SessionInfo[];
}

export function ChatsBrowser({ initialSessions }: ChatsBrowserProps) {
  const [selectedNamespace, setSelectedNamespace] = React.useState<string>("");
  const [chats, setChats] = React.useState<Chat[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [exporting, setExporting] = React.useState<Set<string>>(new Set());

  const loadChats = async () => {
    if (!selectedNamespace) {
      toast.error("Please select a session first");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/chats?namespace=${encodeURIComponent(selectedNamespace)}`,
        { cache: "no-store" },
      );
      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || "Failed to load chats");
        return;
      }
      const data = (await res.json()) as { chats: Chat[] };
      setChats(data.chats);
    } catch {
      toast.error("Could not reach the server");
    } finally {
      setLoading(false);
    }
  };

  const exportChat = async (chatId: string) => {
    if (!selectedNamespace) return;
    setExporting((prev) => new Set(prev).add(chatId));
    try {
      const res = await fetch("/api/chats/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ namespace: selectedNamespace, chatId }),
      });
      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || "Failed to start export");
        return;
      }
      toast.success(
        `Export started for chat ${chatId}. Check /download for progress.`,
      );
    } catch {
      toast.error("Could not reach the server");
    } finally {
      setExporting((prev) => {
        const next = new Set(prev);
        next.delete(chatId);
        return next;
      });
    }
  };

  const connectedSessions = initialSessions.filter(
    (s) => s.status === "connected",
  );

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-end gap-4">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="session-select">Session</Label>
              <select
                id="session-select"
                value={selectedNamespace}
                onChange={(e) => setSelectedNamespace(e.target.value)}
                className="border-input bg-background ring-offset-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
              >
                <option value="">Select a session...</option>
                {connectedSessions.map((session) => (
                  <option key={session.namespace} value={session.namespace}>
                    {session.namespace}
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={() => void loadChats()}
              disabled={loading || !selectedNamespace}
              className="w-fit"
            >
              {loading ? (
                <>
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load chats"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {connectedSessions.length === 0 && (
        <p className="text-muted-foreground text-sm">
          No connected sessions. Create one at /login first.
        </p>
      )}

      {chats.length > 0 && (
        <div className="divide-border divide-y rounded-lg border">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate font-medium">{chat.title}</span>
                <Badge variant="secondary">{chat.type}</Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void exportChat(chat.id)}
                disabled={exporting.has(chat.id)}
                className="shrink-0"
              >
                {exporting.has(chat.id) ? (
                  <Loader2Icon className="mr-1 size-3 animate-spin" />
                ) : (
                  <FileDownIcon className="mr-1 size-3" />
                )}
                Export
              </Button>
            </div>
          ))}
        </div>
      )}

      {!loading && chats.length === 0 && selectedNamespace && (
        <p className="text-muted-foreground text-sm">
          No chats found. Click Load chats to fetch them.
        </p>
      )}
    </div>
  );
}
