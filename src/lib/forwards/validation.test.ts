import { describe, expect, it } from "vitest";

import {
  buildForwardArgs,
  forwardSchema,
  ForwardRequest,
} from "@/lib/forwards/validation";

describe("buildForwardArgs", () => {
  it("builds args with minimal input", () => {
    const input: ForwardRequest = {
      namespace: "test",
      from: ["https://t.me/chat1/123", "https://t.me/chat2/456"],
      to: "destination_chat",
    };
    const args = buildForwardArgs(input);
    expect(args).toEqual([
      "forward",
      "-n",
      "test",
      "--from",
      "https://t.me/chat1/123",
      "--from",
      "https://t.me/chat2/456",
      "--to",
      "destination_chat",
    ]);
  });

  it("includes silent flag when true", () => {
    const input: ForwardRequest = {
      namespace: "test",
      from: ["https://t.me/chat1/123"],
      to: "dest",
      silent: true,
    };
    const args = buildForwardArgs(input);
    expect(args).toContain("--silent");
  });

  it("excludes silent flag when false", () => {
    const input: ForwardRequest = {
      namespace: "test",
      from: ["https://t.me/chat1/123"],
      to: "dest",
      silent: false,
    };
    const args = buildForwardArgs(input);
    expect(args).not.toContain("--silent");
  });
});

describe("forwardSchema", () => {
  it("validates correct input", () => {
    const valid = {
      namespace: "test",
      from: ["https://t.me/chat1/123", "https://t.me/chat2/456"],
      to: "destination",
      silent: true,
    };
    const result = forwardSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("validates input without optional fields", () => {
    const valid = {
      namespace: "test",
      from: ["https://t.me/chat1/123"],
      to: "dest",
    };
    const result = forwardSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects empty from links", () => {
    const invalid = {
      namespace: "test",
      from: [],
      to: "dest",
    };
    const result = forwardSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    expect(result.error?.issues.some((i) => i.path.includes("from"))).toBe(
      true,
    );
  });

  it("rejects non-t.me links", () => {
    const invalid = {
      namespace: "test",
      from: ["https://example.com/123"],
      to: "dest",
    };
    const result = forwardSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    expect(result.error?.issues.some((i) => i.path.includes("from"))).toBe(
      true,
    );
  });

  it("rejects empty destination", () => {
    const invalid = {
      namespace: "test",
      from: ["https://t.me/chat1/123"],
      to: "",
    };
    const result = forwardSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    expect(result.error?.issues.some((i) => i.path.includes("to"))).toBe(true);
  });
});
