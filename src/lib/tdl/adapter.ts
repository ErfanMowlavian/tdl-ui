import { getConfig } from "@/lib/config";
import { MockTdlAdapter } from "@/lib/tdl/mock-adapter";
import { RealTdlAdapter } from "@/lib/tdl/real-adapter";
import type { TdlAdapter } from "@/lib/tdl/types";

/**
 * Build the adapter selected by configuration. The rest of the app calls
 * `getAdapter()` and is oblivious to which implementation it receives.
 */
export function createAdapter(): TdlAdapter {
  const config = getConfig();
  return config.mode === "mock"
    ? new MockTdlAdapter()
    : new RealTdlAdapter(config.bin);
}

// Cache on globalThis so the singleton survives dev hot-reloads.
const globalForAdapter = globalThis as unknown as {
  __tdlAdapter?: TdlAdapter;
};

export function getAdapter(): TdlAdapter {
  globalForAdapter.__tdlAdapter ??= createAdapter();
  return globalForAdapter.__tdlAdapter;
}
