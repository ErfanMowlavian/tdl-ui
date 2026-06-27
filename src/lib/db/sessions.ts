import type { DatabaseSync } from "node:sqlite";

import { getDb } from "@/lib/db";
import type { SessionInfo, SessionStatus } from "@/lib/sessions/types";

interface SessionRow {
  namespace: string;
  label: string | null;
  status: string;
  account: string | null;
  created_at: number | bigint;
  updated_at: number | bigint;
}

function rowToSession(row: SessionRow): SessionInfo {
  return {
    namespace: row.namespace,
    label: row.label,
    status: row.status as SessionStatus,
    account: row.account,
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}

/** Data-access for tracked tdl sessions. */
export class SessionRepository {
  constructor(private readonly db: DatabaseSync = getDb()) {}

  /** Record (or refresh) a session, preserving its original created_at. */
  upsert(input: {
    namespace: string;
    label?: string | null;
    status: SessionStatus;
    account?: string | null;
    now: number;
  }): void {
    this.db
      .prepare(
        `INSERT INTO sessions (namespace, label, status, account, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(namespace) DO UPDATE SET
           label = excluded.label,
           status = excluded.status,
           account = excluded.account,
           updated_at = excluded.updated_at`,
      )
      .run(
        input.namespace,
        input.label ?? null,
        input.status,
        input.account ?? null,
        input.now,
        input.now,
      );
  }

  get(namespace: string): SessionInfo | null {
    const row = this.db
      .prepare("SELECT * FROM sessions WHERE namespace = ?")
      .get(namespace) as unknown;
    return row ? rowToSession(row as SessionRow) : null;
  }

  list(): SessionInfo[] {
    const rows = this.db
      .prepare("SELECT * FROM sessions ORDER BY created_at ASC")
      .all() as unknown[];
    return rows.map((row) => rowToSession(row as SessionRow));
  }

  remove(namespace: string): void {
    this.db.prepare("DELETE FROM sessions WHERE namespace = ?").run(namespace);
  }
}

// Cache on globalThis so dev hot-reloads reuse one repository.
const globalForRepo = globalThis as unknown as {
  __sessionRepo?: SessionRepository;
};

export function getSessionRepository(): SessionRepository {
  globalForRepo.__sessionRepo ??= new SessionRepository();
  return globalForRepo.__sessionRepo;
}
