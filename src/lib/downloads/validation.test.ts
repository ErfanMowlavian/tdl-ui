import { describe, expect, it } from "vitest";

import {
  buildDownloadArgs,
  downloadSchema,
  DownloadRequest,
} from "@/lib/downloads/validation";

describe("buildDownloadArgs", () => {
  it("builds args with minimal input", () => {
    const input: DownloadRequest = {
      namespace: "test",
      urls: ["https://t.me/chat1/123", "https://t.me/chat2/456"],
      threads: 1,
      limit: 1,
    };
    const args = buildDownloadArgs(input);
    expect(args).toEqual([
      "dl",
      "-n",
      "test",
      "-u",
      "https://t.me/chat1/123",
      "-u",
      "https://t.me/chat2/456",
      "-t",
      "1",
      "-l",
      "1",
    ]);
  });

  it("includes optional output directory", () => {
    const input: DownloadRequest = {
      namespace: "test",
      urls: ["https://t.me/chat1/123"],
      threads: 1,
      limit: 1,
      dir: "/tmp/dump",
    };
    const args = buildDownloadArgs(input);
    expect(args).toContain("-d");
    expect(args).toContain("/tmp/dump");
  });

  it("includes threads when provided", () => {
    const input: DownloadRequest = {
      namespace: "test",
      urls: ["https://t.me/chat1/123"],
      threads: 8,
      limit: 1,
    };
    const args = buildDownloadArgs(input);
    expect(args).toContain("-t");
    expect(args).toContain("8");
  });

  it("includes limit when provided", () => {
    const input: DownloadRequest = {
      namespace: "test",
      urls: ["https://t.me/chat1/123"],
      threads: 1,
      limit: 4,
    };
    const args = buildDownloadArgs(input);
    expect(args).toContain("-l");
    expect(args).toContain("4");
  });

  it("includes include/exclude extensions", () => {
    const input: DownloadRequest = {
      namespace: "test",
      urls: ["https://t.me/chat1/123"],
      threads: 1,
      limit: 1,
      include: "jpg,png,gif",
      exclude: "pdf,docx",
    };
    const args = buildDownloadArgs(input);
    expect(args).toContain("-i");
    expect(args).toContain("jpg,png,gif");
    expect(args).toContain("-e");
    expect(args).toContain("pdf,docx");
  });

  it("includes group flag when true", () => {
    const input: DownloadRequest = {
      namespace: "test",
      urls: ["https://t.me/chat1/123"],
      threads: 1,
      limit: 1,
      group: true,
    };
    const args = buildDownloadArgs(input);
    expect(args).toContain("--group");
  });

  it("includes skip-same flag when true", () => {
    const input: DownloadRequest = {
      namespace: "test",
      urls: ["https://t.me/chat1/123"],
      threads: 1,
      limit: 1,
      skipSame: true,
    };
    const args = buildDownloadArgs(input);
    expect(args).toContain("--skip-same");
  });

  it("excludes optional flags when false or undefined", () => {
    const input: DownloadRequest = {
      namespace: "test",
      urls: ["https://t.me/chat1/123"],
      threads: 1,
      limit: 1,
      group: false,
    };
    const args = buildDownloadArgs(input);
    expect(args).not.toContain("--group");
  });
});

describe("downloadSchema", () => {
  it("validates correct input", () => {
    const valid = {
      namespace: "test",
      urls: ["https://t.me/chat1/123", "https://t.me/chat2/456"],
      dir: "/tmp/dump",
      threads: 8,
      limit: 4,
      include: "jpg,png",
      exclude: "pdf",
      group: true,
      skipSame: false,
    };
    const result = downloadSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects empty URLs", () => {
    const invalid = {
      namespace: "test",
      urls: [],
    };
    const result = downloadSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    expect(result.error?.issues.some((i) => i.path.includes("urls"))).toBe(
      true,
    );
  });

  it("rejects non-t.me URLs", () => {
    const invalid = {
      namespace: "test",
      urls: ["https://example.com/123"],
      threads: 1,
      limit: 1,
    };
    const result = downloadSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    expect(result.error?.issues.some((i) => i.path.includes("urls"))).toBe(
      true,
    );
  });

  it("enforces threads range", () => {
    const invalid = {
      namespace: "test",
      urls: ["https://t.me/chat1/123"],
      threads: 0,
      limit: 1,
    };
    const result = downloadSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    expect(result.error?.issues.some((i) => i.path.includes("threads"))).toBe(
      true,
    );
  });

  it("enforces threads max 16", () => {
    const invalid = {
      namespace: "test",
      urls: ["https://t.me/chat1/123"],
      threads: 17,
      limit: 1,
    };
    const result = downloadSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("enforces limit max 8", () => {
    const invalid = {
      namespace: "test",
      urls: ["https://t.me/chat1/123"],
      threads: 1,
      limit: 9,
    };
    const result = downloadSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
