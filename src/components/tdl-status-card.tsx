"use client";

import * as React from "react";
import { CheckCircle2Icon, RefreshCwIcon, XCircleIcon } from "lucide-react";

import type { TdlInfo } from "@/lib/tdl/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type State =
  | { status: "loading" }
  | { status: "ready"; info: TdlInfo }
  | { status: "error" };

export function TdlStatusCard({ initialInfo }: { initialInfo: TdlInfo }) {
  // Seeded from the server render, so there is no mount-time fetch. The refresh
  // button (an event handler) re-queries the status endpoint on demand.
  const [state, setState] = React.useState<State>({
    status: "ready",
    info: initialInfo,
  });

  const refresh = React.useCallback(async () => {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/tdl/status", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const info = (await res.json()) as TdlInfo;
      setState({ status: "ready", info });
    } catch {
      setState({ status: "error" });
    }
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div className="space-y-1.5">
          <CardTitle>tdl status</CardTitle>
          <CardDescription>
            Whether the tdl binary is reachable and which adapter is active.
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => void refresh()}
          disabled={state.status === "loading"}
          aria-label="Refresh status"
        >
          <RefreshCwIcon
            className={state.status === "loading" ? "animate-spin" : undefined}
          />
        </Button>
      </CardHeader>
      <CardContent>
        {state.status === "loading" ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-64" />
          </div>
        ) : state.status === "error" ? (
          <p className="text-destructive text-sm">
            Could not reach the status endpoint.
          </p>
        ) : (
          <StatusDetails info={state.info} />
        )}
      </CardContent>
    </Card>
  );
}

function StatusDetails({ info }: { info: TdlInfo }) {
  return (
    <dl className="grid gap-3 text-sm sm:grid-cols-[8rem_1fr]">
      <dt className="text-muted-foreground">Mode</dt>
      <dd>
        <Badge variant={info.mode === "mock" ? "secondary" : "default"}>
          {info.mode}
        </Badge>
      </dd>

      <dt className="text-muted-foreground">Availability</dt>
      <dd className="flex items-center gap-1.5">
        {info.available ? (
          <>
            <CheckCircle2Icon className="size-4 text-emerald-500" />
            Available
          </>
        ) : (
          <>
            <XCircleIcon className="text-destructive size-4" />
            Not found
          </>
        )}
      </dd>

      <dt className="text-muted-foreground">Binary</dt>
      <dd className="font-mono text-xs break-all">{info.bin}</dd>

      <dt className="text-muted-foreground">Version</dt>
      <dd className="font-mono text-xs">{info.version ?? "—"}</dd>

      {info.error ? (
        <>
          <dt className="text-muted-foreground">Details</dt>
          <dd className="text-muted-foreground text-xs">{info.error}</dd>
        </>
      ) : null}
    </dl>
  );
}
