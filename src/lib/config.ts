import path from "node:path";

import type { TdlMode } from "@/lib/tdl/types";

/**
 * Server-side runtime configuration, sourced from environment variables.
 * See `.env.example` for the full list and defaults.
 */
export interface AppConfig {
  /** Which adapter implementation to use. */
  mode: TdlMode;
  /** The tdl binary name or absolute path. */
  bin: string;
  /** Directory for the SQLite database and other app data. */
  dataDir: string;
  /** Default directory downloads are written to. */
  downloadDir: string;
}

function resolveMode(raw: string | undefined): TdlMode {
  return raw?.toLowerCase() === "mock" ? "mock" : "real";
}

export function getConfig(): AppConfig {
  const cwd = process.cwd();
  return {
    mode: resolveMode(process.env.TDL_MODE),
    bin: process.env.TDL_BIN?.trim() || "tdl",
    dataDir: path.resolve(cwd, process.env.TDL_DATA_DIR?.trim() || "data"),
    downloadDir: path.resolve(
      cwd,
      process.env.TDL_DOWNLOAD_DIR?.trim() || "downloads",
    ),
  };
}
