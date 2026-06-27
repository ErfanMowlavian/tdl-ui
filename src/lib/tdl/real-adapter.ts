import { spawn } from "node:child_process";

import { parseProgressLine, splitRenderSegments } from "@/lib/tdl/progress";
import type {
  RunHandle,
  RunOptions,
  RunResult,
  TdlAdapter,
  TdlInfo,
} from "@/lib/tdl/types";

const VERSION_PATTERN = /v?\d+\.\d+\.\d+\S*/;
const STDERR_TAIL_LIMIT = 4000;

/** Adapter that drives the real tdl binary via child processes. */
export class RealTdlAdapter implements TdlAdapter {
  readonly mode = "real" as const;

  constructor(private readonly bin: string) {}

  detect(): Promise<TdlInfo> {
    return new Promise((resolve) => {
      let stdout = "";
      let settled = false;

      const finish = (info: TdlInfo) => {
        if (settled) return;
        settled = true;
        resolve(info);
      };

      let child;
      try {
        child = spawn(this.bin, ["version"], {
          stdio: ["ignore", "pipe", "pipe"],
        });
      } catch (error) {
        finish(this.unavailable(error));
        return;
      }

      child.stdout?.on("data", (buf: Buffer) => {
        stdout += buf.toString();
      });
      child.on("error", (error) => finish(this.unavailable(error)));
      child.on("close", (code) => {
        if (code !== 0) {
          finish(
            this.unavailable(new Error(`tdl version exited with ${code}`)),
          );
          return;
        }
        finish({
          available: true,
          mode: this.mode,
          bin: this.bin,
          version: stdout.match(VERSION_PATTERN)?.[0] ?? null,
        });
      });
    });
  }

  run(options: RunOptions): RunHandle {
    let canceled = false;
    let stderrTail = "";

    const child = spawn(this.bin, options.args, {
      cwd: options.cwd,
      // Disable color so progress output is easier to parse.
      env: { ...process.env, NO_COLOR: "1" },
      stdio: ["ignore", "pipe", "pipe"],
    });

    const handleChunk = (chunk: string) => {
      for (const segment of splitRenderSegments(chunk)) {
        const progress = parseProgressLine(segment);
        if (progress) {
          options.onProgress?.(progress);
        } else {
          options.onLog?.(segment);
        }
      }
    };

    child.stdout?.on("data", (buf: Buffer) => handleChunk(buf.toString()));
    child.stderr?.on("data", (buf: Buffer) => {
      const text = buf.toString();
      stderrTail = (stderrTail + text).slice(-STDERR_TAIL_LIMIT);
      handleChunk(text);
    });

    const done = new Promise<RunResult>((resolve) => {
      child.on("error", (error) => {
        stderrTail = (stderrTail + String(error)).slice(-STDERR_TAIL_LIMIT);
        resolve({ code: null, canceled, stderr: stderrTail });
      });
      child.on("close", (code) => {
        resolve({ code, canceled, stderr: stderrTail });
      });
    });

    return {
      cancel: () => {
        canceled = true;
        child.kill("SIGTERM");
      },
      done,
    };
  }

  private unavailable(error: unknown): TdlInfo {
    return {
      available: false,
      mode: this.mode,
      bin: this.bin,
      version: null,
      error:
        error instanceof Error
          ? `Could not run "${this.bin}": ${error.message}`
          : `Could not run "${this.bin}"`,
    };
  }
}
