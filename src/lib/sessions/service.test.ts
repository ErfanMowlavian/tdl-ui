import { describe, expect, it } from "vitest";

import { createMemoryDb } from "@/lib/db";
import { SessionRepository } from "@/lib/db/sessions";
import { SessionService } from "@/lib/sessions/service";
import { MockTdlAdapter } from "@/lib/tdl/mock-adapter";
import type { QrLoginState, QrLoginStatus } from "@/lib/sessions/types";

function makeService() {
  const adapter = new MockTdlAdapter({ intervalMs: 2 });
  const repo = new SessionRepository(createMemoryDb());
  return new SessionService(adapter, repo);
}

function waitForQrStatus(
  service: SessionService,
  namespace: string,
  status: QrLoginStatus,
  collected: QrLoginState[] = [],
) {
  return new Promise<QrLoginState[]>((resolve) => {
    const unsubscribe = service.subscribeQr(namespace, (event) => {
      if (event.type !== "state") return;
      collected.push(event.state);
      if (event.state.status === status) {
        unsubscribe();
        resolve(collected);
      }
    });
  });
}

describe("SessionService", () => {
  it("records a connected session after desktop import", async () => {
    const service = makeService();
    const result = await service.loginDesktop({ namespace: "work" });

    expect(result.ok).toBe(true);
    const sessions = service.listSessions();
    expect(sessions).toHaveLength(1);
    expect(sessions[0]).toMatchObject({
      namespace: "work",
      status: "connected",
    });
  });

  it("connects an existing CLI session when the namespace is authenticated", async () => {
    const service = makeService();
    const result = await service.connectExisting("cli-ns");

    expect(result.ok).toBe(true);
    expect(service.listSessions().some((s) => s.namespace === "cli-ns")).toBe(
      true,
    );
  });

  it("captures a QR url and connects via QR login", async () => {
    const service = makeService();
    const initial = service.startQrLogin("qr1");
    expect(initial.status).toBe("starting");

    const states = await waitForQrStatus(service, "qr1", "connected");

    expect(states.some((s) => s.qrUrl?.includes("tg://login"))).toBe(true);
    expect(service.listSessions().some((s) => s.namespace === "qr1")).toBe(
      true,
    );
  });

  it("cancels an in-progress QR login", async () => {
    const service = makeService();
    service.startQrLogin("cancelme");
    const done = waitForQrStatus(service, "cancelme", "canceled");

    expect(service.cancelQrLogin("cancelme")).toBe(true);
    const states = await done;

    expect(states.at(-1)?.status).toBe("canceled");
    expect(service.listSessions().some((s) => s.namespace === "cancelme")).toBe(
      false,
    );
  });

  it("removes a session", async () => {
    const service = makeService();
    await service.loginDesktop({ namespace: "temp" });
    service.removeSession("temp");
    expect(service.listSessions()).toHaveLength(0);
  });
});
