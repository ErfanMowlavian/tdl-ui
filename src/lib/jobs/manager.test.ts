import { describe, expect, it } from "vitest";

import { createMemoryDb } from "@/lib/db";
import { JobRepository } from "@/lib/db/jobs";
import { JobManager } from "@/lib/jobs/manager";
import { MockTdlAdapter } from "@/lib/tdl/mock-adapter";
import type { JobEvent, JobStatus } from "@/lib/tdl/types";

function makeManager(ticks = 3) {
  const adapter = new MockTdlAdapter({ ticks, intervalMs: 1 });
  const repo = new JobRepository(createMemoryDb());
  return new JobManager(adapter, repo);
}

function waitForStatus(manager: JobManager, status: JobStatus) {
  return new Promise<void>((resolve) => {
    const unsubscribe = manager.subscribe((event) => {
      if (event.type === "status" && event.status === status) {
        unsubscribe();
        resolve();
      }
    });
  });
}

describe("JobManager", () => {
  it("runs a job to completion and broadcasts events", async () => {
    const manager = makeManager();
    const events: JobEvent[] = [];
    manager.subscribe((event) => events.push(event));

    const done = waitForStatus(manager, "completed");
    const job = manager.create({
      kind: "download",
      title: "Download test",
      args: ["dl", "-u", "https://t.me/x/1"],
    });
    expect(job.status).toBe("running");

    await done;

    const stored = manager.get(job.id);
    expect(stored?.status).toBe("completed");
    expect(stored?.progress.percent).toBe(100);

    expect(events.some((e) => e.type === "created")).toBe(true);
    expect(events.some((e) => e.type === "progress")).toBe(true);
    expect(events.some((e) => e.type === "status")).toBe(true);
  });

  it("persists created jobs so they appear in the list", async () => {
    const manager = makeManager();
    const done = waitForStatus(manager, "completed");
    const job = manager.create({ kind: "upload", title: "Up", args: ["up"] });
    expect(manager.list().map((j) => j.id)).toContain(job.id);
    await done;
  });

  it("cancels a running job", async () => {
    const manager = makeManager(1000);
    const canceled = waitForStatus(manager, "canceled");
    const job = manager.create({
      kind: "download",
      title: "Big",
      args: ["dl"],
    });

    expect(manager.cancel(job.id)).toBe(true);
    await canceled;

    expect(manager.get(job.id)?.status).toBe("canceled");
  });

  it("returns false when canceling an unknown job", () => {
    const manager = makeManager();
    expect(manager.cancel("does-not-exist")).toBe(false);
  });
});
