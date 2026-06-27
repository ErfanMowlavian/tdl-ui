import { describe, expect, it } from "vitest";

import {
  parseDuration,
  parseProgressLine,
  parseSize,
  splitRenderSegments,
  stripAnsi,
} from "@/lib/tdl/progress";

const ESC = String.fromCharCode(27);

describe("stripAnsi", () => {
  it("removes escape sequences", () => {
    expect(stripAnsi(`${ESC}[31mred${ESC}[0m`)).toBe("red");
  });
});

describe("parseSize", () => {
  it("parses decimal units", () => {
    expect(parseSize("4.5", "MB")).toBe(4_500_000);
  });
  it("parses binary units", () => {
    expect(parseSize("1", "GiB")).toBe(1_073_741_824);
  });
  it("returns undefined for unknown units", () => {
    expect(parseSize("1", "parsecs")).toBeUndefined();
  });
});

describe("parseDuration", () => {
  it("parses compound durations", () => {
    expect(parseDuration("1m30s")).toBe(90);
    expect(parseDuration("1h2m3s")).toBe(3723);
    expect(parseDuration("45s")).toBe(45);
  });
  it("returns undefined when empty", () => {
    expect(parseDuration("")).toBeUndefined();
  });
});

describe("parseProgressLine", () => {
  it("extracts percent, transfer, speed, and eta", () => {
    const progress = parseProgressLine(
      "45% |####      | (4.5 MB/10 MB, 2.3 MB/s) [2s:3s]",
    );
    expect(progress).not.toBeNull();
    expect(progress?.percent).toBe(45);
    expect(progress?.current).toBe(4_500_000);
    expect(progress?.total).toBe(10_000_000);
    expect(progress?.speed).toBe(2_300_000);
    expect(progress?.etaSeconds).toBe(3);
  });

  it("derives percent from transfer when no percentage is present", () => {
    const progress = parseProgressLine("(5 MB/10 MB)");
    expect(progress?.percent).toBe(50);
  });

  it("clamps percent to the 0-100 range", () => {
    expect(parseProgressLine("250%")?.percent).toBe(100);
  });

  it("returns null for lines without progress", () => {
    expect(parseProgressLine("logged in as @someone")).toBeNull();
    expect(parseProgressLine("   ")).toBeNull();
  });
});

describe("splitRenderSegments", () => {
  it("splits on carriage returns and newlines", () => {
    expect(splitRenderSegments("a\rb\nc\r\n d ")).toEqual(["a", "b", "c", "d"]);
  });
});
