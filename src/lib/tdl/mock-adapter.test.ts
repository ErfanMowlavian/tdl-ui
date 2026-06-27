import { describe, expect, it } from "vitest";

import { MockTdlAdapter } from "@/lib/tdl/mock-adapter";
import type { JobProgress } from "@/lib/tdl/types";

describe("MockTdlAdapter", () => {
  it("reports as available", async () => {
    const info = await new MockTdlAdapter().detect();
    expect(info.available).toBe(true);
    expect(info.mode).toBe("mock");
    expect(info.version).toContain("mock");
  });

  it("emits increasing progress and completes successfully", async () => {
    const adapter = new MockTdlAdapter({ ticks: 4, intervalMs: 1 });
    const updates: JobProgress[] = [];

    const handle = adapter.run({
      args: ["dl", "-u", "https://t.me/x/1"],
      onProgress: (p) => updates.push(p),
    });
    const result = await handle.done;

    expect(result.code).toBe(0);
    expect(result.canceled).toBe(false);
    expect(updates.length).toBe(4);
    expect(updates.at(-1)?.percent).toBe(100);
    const percents = updates.map((u) => u.percent);
    expect([...percents].sort((a, b) => a - b)).toEqual(percents);
  });

  it("stops and reports cancellation", async () => {
    const adapter = new MockTdlAdapter({ ticks: 100, intervalMs: 1 });
    const handle = adapter.run({ args: ["dl"] });
    handle.cancel();
    const result = await handle.done;

    expect(result.canceled).toBe(true);
    expect(result.code).toBeNull();
  });
});
