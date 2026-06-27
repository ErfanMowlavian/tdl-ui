import type { DatabaseSync } from "node:sqlite";

import { getDb } from "@/lib/db";
import type { Job, JobProgress, JobStatus } from "@/lib/tdl/types";

interface JobRow {
  id: string;
  kind: string;
  status: string;
  namespace: string;
  title: string;
  args: string;
  progress: string;
  error: string | null;
  created_at: number | bigint;
  updated_at: number | bigint;
}

function rowToJob(row: JobRow): Job {
  return {
    id: row.id,
    kind: row.kind as Job["kind"],
    status: row.status as JobStatus,
    namespace: row.namespace,
    title: row.title,
    args: JSON.parse(row.args) as string[],
    progress: JSON.parse(row.progress) as JobProgress,
    error: row.error,
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}

/** Data-access for jobs. Pass a db for tests; defaults to the shared one. */
export class JobRepository {
  constructor(private readonly db: DatabaseSync = getDb()) {}

  /** Insert or update a job in full. */
  save(job: Job): void {
    this.db
      .prepare(
        `INSERT INTO jobs (id, kind, status, namespace, title, args, progress, error, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           status = excluded.status,
           title = excluded.title,
           args = excluded.args,
           progress = excluded.progress,
           error = excluded.error,
           updated_at = excluded.updated_at`,
      )
      .run(
        job.id,
        job.kind,
        job.status,
        job.namespace,
        job.title,
        JSON.stringify(job.args),
        JSON.stringify(job.progress),
        job.error,
        job.createdAt,
        job.updatedAt,
      );
  }

  get(id: string): Job | null {
    const row = this.db.prepare("SELECT * FROM jobs WHERE id = ?").get(id) as
      | unknown
      | undefined;
    return row ? rowToJob(row as JobRow) : null;
  }

  list(limit = 100): Job[] {
    const rows = this.db
      .prepare("SELECT * FROM jobs ORDER BY created_at DESC LIMIT ?")
      .all(limit) as unknown[];
    return rows.map((row) => rowToJob(row as JobRow));
  }

  remove(id: string): void {
    this.db.prepare("DELETE FROM jobs WHERE id = ?").run(id);
  }

  /**
   * Mark jobs that were mid-flight as failed. Called on boot, since any
   * "running" job from a previous process is no longer actually running.
   */
  failInterrupted(now: number): number {
    const result = this.db
      .prepare(
        `UPDATE jobs
         SET status = 'failed', error = 'Interrupted by restart', updated_at = ?
         WHERE status IN ('running', 'queued')`,
      )
      .run(now);
    return Number(result.changes);
  }
}

// Cache on globalThis so dev hot-reloads reuse one repository.
const globalForRepo = globalThis as unknown as { __jobRepo?: JobRepository };

export function getJobRepository(): JobRepository {
  globalForRepo.__jobRepo ??= new JobRepository();
  return globalForRepo.__jobRepo;
}
