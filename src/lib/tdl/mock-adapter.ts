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

/** A representative QR URL the QR-login parser can pick up. */
export const MOCK_QR_URL = "tg://login?token=MOCK_TOKEN";

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
    if (options.args[0] === "login") return this.runLogin(options);
    return this.runProgress(options);
  }

  private runLogin(options: RunOptions): RunHandle {
    const { intervalMs } = this.options;
    const isQr = options.args.includes("qr");
    let settle: ((result: RunResult) => void) | null = null;
    let timer: ReturnType<typeof setInterval> | undefined;

    const done = new Promise<RunResult>((resolve) => {
      const finish = (result: RunResult) => {
        if (timer) clearInterval(timer);
        settle = null;
        resolve(result);
      };
      settle = finish;

      if (isQr) {
        options.onLog?.("mock: starting QR login");
        let step = 0;
        timer = setInterval(() => {
          step += 1;
          if (step === 1) {
            options.onLog?.(`Scan to log in: ${MOCK_QR_URL}`);
          } else if (step >= 3) {
            options.onLog?.("Login successfully");
            finish({ code: 0, canceled: false, stderr: "" });
          }
        }, intervalMs);
      } else {
        options.onLog?.("mock: importing desktop session");
        timer = setInterval(() => {
          options.onLog?.("Login successfully");
          finish({ code: 0, canceled: false, stderr: "" });
        }, intervalMs);
      }
    });

    return {
      cancel: () => settle?.({ code: null, canceled: true, stderr: "" }),
      done,
    };
  }

  private runProgress(options: RunOptions): RunHandle {
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
