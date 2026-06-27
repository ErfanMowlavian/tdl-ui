import { randomUUID } from "node:crypto";

import { getJobRepository, JobRepository } from "@/lib/db/jobs";
import { getAdapter } from "@/lib/tdl/adapter";
import type {
  Job,
  JobEvent,
  JobKind,
  RunHandle,
  TdlAdapter,
} from "@/lib/tdl/types";
import { EMPTY_PROGRESS } from "@/lib/tdl/types";

export interface CreateJobInput {
  kind: JobKind;
  title: string;
  args: string[];
  namespace?: string;
}

type Listener = (event: JobEvent) => void;

/**
 * Owns the lifecycle of jobs: creates them, runs them through the adapter,
 * persists state, and broadcasts events to subscribers (the SSE endpoint).
 */
export class JobManager {
  private readonly active = new Map<string, RunHandle>();
  private readonly listeners = new Set<Listener>();

  constructor(
    private readonly adapter: TdlAdapter = getAdapter(),
    private readonly repo: JobRepository = getJobRepository(),
  ) {}

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  list(limit?: number): Job[] {
    return this.repo.list(limit);
  }

  get(id: string): Job | null {
    return this.repo.get(id);
  }

  create(input: CreateJobInput): Job {
    const now = Date.now();
    const job: Job = {
      id: randomUUID(),
      kind: input.kind,
      status: "running",
      namespace: input.namespace ?? "default",
      title: input.title,
      args: input.args,
      progress: { ...EMPTY_PROGRESS },
      createdAt: now,
      updatedAt: now,
      error: null,
    };

    this.repo.save(job);
    this.emit({ type: "created", job });
    this.start(job);
    return job;
  }

  cancel(id: string): boolean {
    const handle = this.active.get(id);
    if (!handle) return false;
    handle.cancel();
    return true;
  }

  private start(job: Job): void {
    const handle = this.adapter.run({
      args: job.args,
      onProgress: (progress) => {
        job.progress = progress;
        job.updatedAt = Date.now();
        this.repo.save(job);
        this.emit({ type: "progress", id: job.id, progress });
      },
      onLog: (line) => this.emit({ type: "log", id: job.id, line }),
    });

    this.active.set(job.id, handle);

    void handle.done.then((result) => {
      this.active.delete(job.id);
      job.updatedAt = Date.now();
      if (result.canceled) {
        job.status = "canceled";
        job.error = null;
      } else if (result.code === 0) {
        job.status = "completed";
        job.progress = { ...job.progress, percent: 100 };
      } else {
        job.status = "failed";
        job.error =
          result.stderr.trim() ||
          `tdl exited with code ${result.code ?? "unknown"}`;
      }
      this.repo.save(job);
      this.emit({
        type: "status",
        id: job.id,
        status: job.status,
        error: job.error,
      });
    });
  }

  private emit(event: JobEvent): void {
    for (const listener of this.listeners) listener(event);
  }
}

// Cache on globalThis so every route handler shares one manager (and its
// in-memory subscriber list and active handles) across dev hot-reloads.
const globalForManager = globalThis as unknown as { __jobManager?: JobManager };

export function getJobManager(): JobManager {
  if (!globalForManager.__jobManager) {
    const manager = new JobManager();
    getJobRepository().failInterrupted(Date.now());
    globalForManager.__jobManager = manager;
  }
  return globalForManager.__jobManager;
}
