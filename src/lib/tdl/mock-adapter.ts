import type {
  RunHandle,
  RunOptions,
  RunResult,
  TdlAdapter,
  TdlInfo,
} from "@/lib/tdl/types";

export interface MockOptions {
  /** Number of progress ticks emitted per run. */
  ticks?: number;
  /** Delay between ticks, in milliseconds. */
  intervalMs?: number;
  /** Total simulated bytes, used to fill in size fields. */
  totalBytes?: number;
}

const DEFAULTS = {
  ticks: 10,
  intervalMs: 250,
  totalBytes: 25 * 1024 * 1024,
} satisfies Required<MockOptions>;

/**
 * Adapter that simulates tdl without spawning anything. It lets the whole app
 * — and CI — run end-to-end with no tdl binary and no Telegram account, and
 * gives deterministic, fast progress for tests.
 */
export class MockTdlAdapter implements TdlAdapter {
  readonly mode = "mock" as const;
  private readonly options: Required<MockOptions>;

  constructor(options: MockOptions = {}) {
    this.options = { ...DEFAULTS, ...options };
  }

  async detect(): Promise<TdlInfo> {
    return {
      available: true,
      mode: this.mode,
      bin: "tdl (mock)",
      version: "v0.0.0-mock",
    };
  }

  run(options: RunOptions): RunHandle {
    const { ticks, intervalMs, totalBytes } = this.options;
    let canceled = false;
    let tick = 0;
    let timer: ReturnType<typeof setInterval> | undefined;

    options.onLog?.(`mock: tdl ${options.args.join(" ")}`);

    const done = new Promise<RunResult>((resolve) => {
      const finish = (result: RunResult) => {
        if (timer) clearInterval(timer);
        resolve(result);
      };

      timer = setInterval(() => {
        if (canceled) {
          finish({ code: null, canceled: true, stderr: "" });
          return;
        }

        tick += 1;
        const percent = Math.min(100, Math.round((tick / ticks) * 100));
        options.onProgress?.({
          percent,
          current: Math.round((percent / 100) * totalBytes),
          total: totalBytes,
          speed: Math.round(totalBytes / (ticks * (intervalMs / 1000))),
          etaSeconds: Math.max(
            0,
            Math.round(((ticks - tick) * intervalMs) / 1000),
          ),
          label: "mock-file.bin",
        });

        if (tick >= ticks) {
          options.onLog?.("mock: done");
          finish({ code: 0, canceled: false, stderr: "" });
        }
      }, intervalMs);
    });

    return {
      cancel: () => {
        canceled = true;
      },
      done,
    };
  }
}
