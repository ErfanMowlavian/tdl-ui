import { describe, expect, it } from "vitest";

import {
  buildUploadArgs,
  uploadSchema,
  UploadRequest,
} from "@/lib/uploads/validation";

describe("buildUploadArgs", () => {
  it("builds args with minimal input", () => {
    const input: UploadRequest = {
      namespace: "test",
      paths: ["/tmp/file1.jpg", "/tmp/file2.png"],
    };
    const args = buildUploadArgs(input);
    expect(args).toEqual([
      "up",
      "-n",
      "test",
      "-p",
      "/tmp/file1.jpg",
      "-p",
      "/tmp/file2.png",
    ]);
  });

  it("includes target chat when provided", () => {
    const input: UploadRequest = {
      namespace: "test",
      paths: ["/tmp/file1.jpg"],
      chat: "my_channel",
    };
    const args = buildUploadArgs(input);
    expect(args).toContain("-c");
    expect(args).toContain("my_channel");
  });

  it("includes remove-after flag when true", () => {
    const input: UploadRequest = {
      namespace: "test",
      paths: ["/tmp/file1.jpg"],
      removeAfter: true,
    };
    const args = buildUploadArgs(input);
    expect(args).toContain("--rm");
  });

  it("excludes optional flags when false or undefined", () => {
    const input: UploadRequest = {
      namespace: "test",
      paths: ["/tmp/file1.jpg"],
      chat: undefined,
      removeAfter: false,
    };
    const args = buildUploadArgs(input);
    expect(args).not.toContain("-c");
    expect(args).not.toContain("--rm");
  });
});

describe("uploadSchema", () => {
  it("validates correct input", () => {
    const valid = {
      namespace: "test",
      paths: ["/tmp/file1.jpg", "/tmp/file2.png"],
      chat: "my_channel",
      removeAfter: true,
    };
    const result = uploadSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("validates input without optional fields", () => {
    const valid = {
      namespace: "test",
      paths: ["/tmp/file1.jpg"],
    };
    const result = uploadSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects empty paths", () => {
    const invalid = {
      namespace: "test",
      paths: [],
    };
    const result = uploadSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    expect(result.error?.issues.some((i) => i.path.includes("paths"))).toBe(
      true,
    );
  });

  it("rejects empty string in paths", () => {
    const invalid = {
      namespace: "test",
      paths: [""],
    };
    const result = uploadSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
