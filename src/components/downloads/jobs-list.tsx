"use client";

import * as React from "react";
import { toast } from "sonner";

import type { Job, JobEvent } from "@/lib/tdl/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

function statusVariant(
  status: Job["status"],
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "completed":
      return "default";
    case "failed":
      return "destructive";
    case "running":
      return "secondary";
    default:
      return "outline"; // queued, canceled
  }
}

export function JobsList({ initialJobs }: { initialJobs: Job[] }) {
  const [jobs, setJobs] = React.useState<Job[]>(initialJobs);

  React.useEffect(() => {
    const source = new EventSource("/api/jobs/stream");

    // The initial list comes from `initialJobs`; here we only apply live events.
    source.onmessage = (message) => {
      let event: JobEvent;
      try {
        event = JSON.parse(message.data) as JobEvent;
      } catch {
        return;
      }
      setJobs((current) => {
        switch (event.type) {
          case "created":
            return [event.job, ...current];
          case "progress":
            return current.map((job) =>
              job.id === event.id ? { ...job, progress: event.progress } : job,
            );
          case "status":
            return current.map((job) =>
              job.id === event.id
                ? { ...job, status: event.status, error: event.error }
                : job,
            );
          default:
            return current;
        }
      });
    };

    source.onerror = () => source.close();
    return () => source.close();
  }, []);

  const cancelJob = async (id: string) => {
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    } catch {
      toast.error("Could not cancel job");
    }
  };

  if (jobs.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No download jobs yet. Start one above.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <Card key={job.id}>
          <CardContent className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate font-medium">{job.title}</h3>
                <p className="text-muted-foreground text-xs">
                  {job.namespace} · {new Date(job.createdAt).toLocaleString()}
                </p>
              </div>
              <Badge variant={statusVariant(job.status)}>{job.status}</Badge>
            </div>

            <div className="space-y-1.5">
              <div className="text-muted-foreground flex justify-between text-xs">
                <span>Progress</span>
                <span>{job.progress.percent}%</span>
              </div>
              <Progress value={job.progress.percent} className="h-2" />
            </div>

            {job.error ? (
              <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                {job.error}
              </div>
            ) : null}

            {job.status === "running" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => void cancelJob(job.id)}
              >
                Cancel
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
