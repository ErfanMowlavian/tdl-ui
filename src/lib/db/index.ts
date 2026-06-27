import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import { getConfig } from "@/lib/config";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS jobs (
  id          TEXT PRIMARY KEY,
  kind        TEXT NOT NULL,
  status      TEXT NOT NULL,
  namespace   TEXT NOT NULL,
  title       TEXT NOT NULL,
  args        TEXT NOT NULL,
  progress    TEXT NOT NULL,
  error       TEXT,
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs (created_at DESC);

CREATE TABLE IF NOT EXISTS sessions (
  namespace   TEXT PRIMARY KEY,
  label       TEXT,
  status      TEXT NOT NULL,
  account     TEXT,
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
);
`;

function open(dbPath: string): DatabaseSync {
  if (dbPath !== ":memory:") {
    mkdirSync(path.dirname(dbPath), { recursive: true });
  }
  const db = new DatabaseSync(dbPath);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA busy_timeout = 5000;");
  db.exec(SCHEMA);
  return db;
}

// Cache on globalThis so a single connection survives dev hot-reloads.
const globalForDb = globalThis as unknown as { __tdlDb?: DatabaseSync };

export function getDb(): DatabaseSync {
  globalForDb.__tdlDb ??= open(path.join(getConfig().dataDir, "tdl-ui.db"));
  return globalForDb.__tdlDb;
}

/** Open a fresh in-memory database. Used by tests. */
export function createMemoryDb(): DatabaseSync {
  return open(":memory:");
}
