"use client";

import * as React from "react";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import type { SessionInfo } from "@/lib/sessions/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function SessionsList({
  sessions,
  onChanged,
}: {
  sessions: SessionInfo[];
  onChanged: () => void;
}) {
  const remove = async (namespace: string) => {
    try {
      const res = await fetch(
        `/api/sessions?namespace=${encodeURIComponent(namespace)}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error();
      toast.success(`Removed session "${namespace}"`);
      onChanged();
    } catch {
      toast.error("Could not remove session");
    }
  };

  if (sessions.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No sessions yet. Connect one above to get started.
      </p>
    );
  }

  return (
    <ul className="divide-border divide-y rounded-lg border">
      {sessions.map((session) => (
        <li
          key={session.namespace}
          className="flex items-center justify-between gap-3 px-4 py-3"
        >
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="truncate font-medium">{session.namespace}</span>
              <Badge
                variant={
                  session.status === "connected" ? "default" : "secondary"
                }
              >
                {session.status}
              </Badge>
            </div>
            <p className="text-muted-foreground truncate text-xs">
              {session.account ?? "Account unknown"} · added{" "}
              {new Date(session.createdAt).toLocaleDateString()}
            </p>
          </div>

          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${session.namespace}`}
                />
              }
            >
              <Trash2Icon />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Remove session &ldquo;{session.namespace}&rdquo;?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This removes the session from tdl-ui. You can reconnect it
                  later by logging in again.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => void remove(session.namespace)}
                >
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </li>
      ))}
    </ul>
  );
}
