import { beforeEach, describe, expect, it } from "vitest";

import { createMemoryDb } from "@/lib/db";
import { JobRepository } from "@/lib/db/jobs";
import type { Job } from "@/lib/tdl/types";

function makeJob(overrides: Partial<Job> = {}): Job {
  const now = 1_700_000_000_000;
  return {
    id: "job-1",
    kind: "download",
    status: "running",
    namespace: "default",
    title: "Test job",
    args: ["dl", "-u", "https://t.me/x/1"],
    progress: { percent: 0 },
    createdAt: now,
    updatedAt: now,
    error: null,
    ...overrides,
  };
}

describe("JobRepository", () => {
  let repo: JobRepository;

  beforeEach(() => {
    repo = new JobRepository(createMemoryDb());
  });

  it("saves and retrieves a job, preserving JSON fields", () => {
    const job = makeJob();
    repo.save(job);

    const loaded = repo.get(job.id);
    expect(loaded).toEqual(job);
    expect(loaded?.args).toEqual(["dl", "-u", "https://t.me/x/1"]);
  });

  it("upserts on conflict instead of duplicating", () => {
    repo.save(makeJob());
    repo.save(makeJob({ status: "completed", progress: { percent: 100 } }));

    expect(repo.list()).toHaveLength(1);
    expect(repo.get("job-1")?.status).toBe("completed");
  });

  it("lists jobs newest first", () => {
    repo.save(makeJob({ id: "old", createdAt: 1 }));
    repo.save(makeJob({ id: "new", createdAt: 2 }));
    expect(repo.list().map((j) => j.id)).toEqual(["new", "old"]);
  });

  it("removes jobs", () => {
    repo.save(makeJob());
    repo.remove("job-1");
    expect(repo.get("job-1")).toBeNull();
  });

  it("fails interrupted jobs", () => {
    repo.save(makeJob({ id: "a", status: "running" }));
    repo.save(makeJob({ id: "b", status: "queued" }));
    repo.save(makeJob({ id: "c", status: "completed" }));

    const changed = repo.failInterrupted(2_000_000_000_000);

    expect(changed).toBe(2);
    expect(repo.get("a")?.status).toBe("failed");
    expect(repo.get("b")?.status).toBe("failed");
    expect(repo.get("c")?.status).toBe("completed");
  });
});
