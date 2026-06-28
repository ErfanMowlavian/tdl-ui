import { getSessionRepository, SessionRepository } from "@/lib/db/sessions";
import { getAdapter } from "@/lib/tdl/adapter";
import type { RunHandle, TdlAdapter } from "@/lib/tdl/types";
import type {
  DesktopLoginResult,
  QrLoginEvent,
  QrLoginState,
  SessionInfo,
} from "@/lib/sessions/types";

/** Captures the QR login URL Telegram clients encode. */
const QR_URL_PATTERN = /tg:\/\/login\?\S+/;

type QrListener = (event: QrLoginEvent) => void;

interface ActiveQrLogin {
  state: QrLoginState;
  handle: RunHandle;
  listeners: Set<QrListener>;
}

function failureMessage(code: number | null, stderr: string): string {
  return stderr.trim() || `tdl exited with code ${code ?? "unknown"}`;
}

/**
 * Orchestrates tdl login flows and tracks which namespaces are connected.
 *
 * Inputs are expected to be validated by the caller. Every tdl invocation goes
 * through the adapter with an argument array (never a shell string), so user
 * input cannot be interpreted as a shell command.
 */
export class SessionService {
  private readonly active = new Map<string, ActiveQrLogin>();

  constructor(
    private readonly adapter: TdlAdapter = getAdapter(),
    private readonly repo: SessionRepository = getSessionRepository(),
  ) {}

  listSessions(): SessionInfo[] {
    return this.repo.list();
  }

  removeSession(namespace: string): void {
    this.cancelQrLogin(namespace);
    this.repo.remove(namespace);
  }

  /** Import a Telegram Desktop session. Resolves when tdl finishes. */
  async loginDesktop(input: {
    namespace: string;
    desktopPath?: string;
    passcode?: string;
  }): Promise<DesktopLoginResult> {
    const args = ["login", "-T", "desktop", "-n", input.namespace];
    if (input.desktopPath) args.push("-d", input.desktopPath);
    if (input.passcode) args.push("-p", input.passcode);

    const result = await this.adapter.run({ args }).done;
    if (result.code === 0) {
      this.repo.upsert({
        namespace: input.namespace,
        status: "connected",
        now: Date.now(),
      });
      return { ok: true, error: null };
    }
    return { ok: false, error: failureMessage(result.code, result.stderr) };
  }

  /**
   * Connect a session that was already authenticated with the tdl CLI
   * (`tdl login` in a real terminal). tdl's login is interactive and needs a
   * TTY, which a web server can't provide — but it stores sessions on disk, so
   * we verify the namespace is authenticated (a `chat ls` succeeds) and record
   * it for use across the app.
   */
  async connectExisting(namespace: string): Promise<DesktopLoginResult> {
    const result = await this.adapter.run({
      args: ["chat", "ls", "-o", "json", "-n", namespace],
    }).done;
    if (result.code === 0) {
      this.repo.upsert({ namespace, status: "connected", now: Date.now() });
      return { ok: true, error: null };
    }
    return {
      ok: false,
      error:
        "That namespace isn't logged in yet. Run `tdl login -n " +
        namespace +
        "` in your terminal first.",
    };
  }

  /** Begin a QR login. Progress is delivered via {@link subscribeQr}. */
  startQrLogin(namespace: string): QrLoginState {
    this.cancelQrLogin(namespace);

    const state: QrLoginState = {
      namespace,
      status: "starting",
      qrUrl: null,
      error: null,
    };
    const listeners = new Set<QrListener>();

    const emit = (event: QrLoginEvent) => {
      for (const listener of listeners) listener(event);
    };
    const update = (patch: Partial<QrLoginState>) => {
      Object.assign(state, patch);
      emit({ type: "state", state: { ...state } });
    };

    const handle = this.adapter.run({
      args: ["login", "-T", "qr", "-n", namespace],
      onLog: (line) => {
        emit({ type: "log", line });
        const match = line.match(QR_URL_PATTERN);
        if (match && !state.qrUrl) {
          update({ qrUrl: match[0], status: "waiting" });
        }
      },
    });

    this.active.set(namespace, { state, handle, listeners });

    void handle.done.then((result) => {
      if (result.canceled) {
        update({ status: "canceled" });
      } else if (result.code === 0) {
        this.repo.upsert({ namespace, status: "connected", now: Date.now() });
        update({ status: "connected", qrUrl: null });
      } else {
        update({
          status: "failed",
          error: failureMessage(result.code, result.stderr),
        });
      }
    });

    return { ...state };
  }

  getQrState(namespace: string): QrLoginState | null {
    const active = this.active.get(namespace);
    return active ? { ...active.state } : null;
  }

  subscribeQr(namespace: string, listener: QrListener): () => void {
    const active = this.active.get(namespace);
    if (!active) return () => {};
    active.listeners.add(listener);
    return () => active.listeners.delete(listener);
  }

  cancelQrLogin(namespace: string): boolean {
    const active = this.active.get(namespace);
    if (!active) return false;
    active.handle.cancel();
    return true;
  }
}

// Cache on globalThis so route handlers share active logins across hot-reloads.
const globalForService = globalThis as unknown as {
  __sessionService?: SessionService;
};

export function getSessionService(): SessionService {
  globalForService.__sessionService ??= new SessionService();
  return globalForService.__sessionService;
}
