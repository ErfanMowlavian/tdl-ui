/**
 * Shared types for the tdl integration layer.
 *
 * These describe the contract every feature uses to talk to tdl, regardless of
 * whether the real binary or the mock implementation is behind it.
 */

export type TdlMode = "real" | "mock";

/** Result of probing for the tdl binary. */
export interface TdlInfo {
  /** Whether tdl could be located and queried. */
  available: boolean;
  /** Which adapter answered. */
  mode: TdlMode;
  /** Resolved binary name or path used. */
  bin: string;
  /** Reported version string, or null if unknown/unavailable. */
  version: string | null;
  /** Human-readable reason when `available` is false. */
  error?: string;
}

export type JobKind = "download" | "upload" | "forward" | "export" | "login";

export type JobStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "canceled";

/** Normalized progress, parsed from tdl's terminal output. */
export interface JobProgress {
  /** 0–100. */
  percent: number;
  /** Bytes transferred so far, when known. */
  current?: number;
  /** Total bytes, when known. */
  total?: number;
  /** Bytes per second, when known. */
  speed?: number;
  /** Seconds remaining, when known. */
  etaSeconds?: number;
  /** Current file or item label, when known. */
  label?: string;
}

export interface Job {
  id: string;
  kind: JobKind;
  status: JobStatus;
  /** tdl session namespace this job runs under. */
  namespace: string;
  /** Human-readable title for the UI. */
  title: string;
  /** The tdl arguments used, surfaced for transparency. */
  args: string[];
  progress: JobProgress;
  createdAt: number;
  updatedAt: number;
  error: string | null;
}

/** Events emitted as a job runs, streamed to the browser over SSE. */
export type JobEvent =
  | { type: "created"; job: Job }
  | { type: "progress"; id: string; progress: JobProgress }
  | { type: "status"; id: string; status: JobStatus; error: string | null }
  | { type: "log"; id: string; line: string };

export const EMPTY_PROGRESS: JobProgress = { percent: 0 };

/** Options for running a single tdl invocation. */
export interface RunOptions {
  args: string[];
  cwd?: string;
  onProgress?: (progress: JobProgress) => void;
  onLog?: (line: string) => void;
}

export interface RunResult {
  code: number | null;
  canceled: boolean;
  /** Tail of captured stderr, useful for error messages. */
  stderr: string;
}

export interface RunHandle {
  cancel: () => void;
  done: Promise<RunResult>;
}

/**
 * The single boundary between the app and tdl. Feature code depends on this
 * interface, never on `child_process` directly.
 */
export interface TdlAdapter {
  readonly mode: TdlMode;
  detect(): Promise<TdlInfo>;
  run(options: RunOptions): RunHandle;
}
