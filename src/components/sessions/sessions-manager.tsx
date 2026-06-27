"use client";

import * as React from "react";

import type { SessionInfo } from "@/lib/sessions/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DesktopLogin } from "@/components/sessions/desktop-login";
import { QrLogin } from "@/components/sessions/qr-login";
import { SessionsList } from "@/components/sessions/sessions-list";

export function SessionsManager({
  initialSessions,
}: {
  initialSessions: SessionInfo[];
}) {
  const [sessions, setSessions] = React.useState(initialSessions);

  const refresh = React.useCallback(async () => {
    try {
      const res = await fetch("/api/sessions", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { sessions: SessionInfo[] };
      setSessions(data.sessions);
    } catch {
      // Leave the current list in place on failure.
    }
  }, []);

  const onConnected = React.useCallback(() => void refresh(), [refresh]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Connect a session</CardTitle>
          <CardDescription>
            Authenticate tdl with a QR code or by importing Telegram Desktop.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="qr">
            <TabsList>
              <TabsTrigger value="qr">QR code</TabsTrigger>
              <TabsTrigger value="desktop">Desktop import</TabsTrigger>
            </TabsList>
            <TabsContent value="qr" className="pt-4">
              <QrLogin onConnected={onConnected} />
            </TabsContent>
            <TabsContent value="desktop" className="pt-4">
              <DesktopLogin onConnected={onConnected} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
          <CardDescription>
            Namespaces tdl-ui knows about on this machine.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SessionsList sessions={sessions} onChanged={() => void refresh()} />
        </CardContent>
      </Card>
    </div>
  );
}
