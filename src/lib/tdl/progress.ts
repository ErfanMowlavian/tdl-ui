import type { JobProgress } from "@/lib/tdl/types";

/**
 * Parser for tdl's progress output.
 *
 * tdl renders human progress bars to the terminal rather than emitting
 * machine-readable JSON, so we scrape structured progress from the text. The
 * logic is intentionally tolerant: it extracts whatever fields it can find and
 * ignores the rest, so a cosmetic change in tdl's output degrades gracefully
 * instead of breaking downloads.
 *
 * Keeping this isolated and unit-tested means the rest of the app never deals
 * with raw terminal output, and the parser can be tuned against real samples
 * in one place.
 */

// Matches ANSI/VT100 escape sequences. Built via fromCharCode so we never embed
// a raw control character in a regex literal.
const ANSI_PATTERN = new RegExp(
  `${String.fromCharCode(27)}\\[[0-9;?]*[A-Za-z]`,
  "g",
);

const SIZE_UNITS: Record<string, number> = {
  b: 1,
  kb: 1000,
  mb: 1000 ** 2,
  gb: 1000 ** 3,
  tb: 1000 ** 4,
  kib: 1024,
  mib: 1024 ** 2,
  gib: 1024 ** 3,
  tib: 1024 ** 4,
};

export function stripAnsi(input: string): string {
  return input.replace(ANSI_PATTERN, "");
}

/** Parse a human size like "4.5 MB" or "1.2GiB" into bytes. */
export function parseSize(value: string, unit: string): number | undefined {
  const amount = Number.parseFloat(value);
  if (Number.isNaN(amount)) return undefined;
  const factor = SIZE_UNITS[unit.toLowerCase()];
  if (!factor) return undefined;
  return Math.round(amount * factor);
}

/** Parse a duration like "3s", "1m30s", or "1h2m3s" into seconds. */
export function parseDuration(input: string): number | undefined {
  const match = input.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/);
  if (!match) return undefined;
  const [, h, m, s] = match;
  if (!h && !m && !s) return undefined;
  return (
    Number.parseInt(h ?? "0", 10) * 3600 +
    Number.parseInt(m ?? "0", 10) * 60 +
    Number.parseInt(s ?? "0", 10)
  );
}

const PERCENT = /(\d+(?:\.\d+)?)\s*%/;
const TRANSFER =
  /(\d+(?:\.\d+)?)\s*([KMGT]i?B|B)\s*\/\s*(\d+(?:\.\d+)?)\s*([KMGT]i?B|B)/i;
const SPEED = /(\d+(?:\.\d+)?)\s*([KMGT]i?B|B)\s*\/\s*s/i;
const ETA = /\[[^\]]*?:\s*([0-9hms]+)\s*\]/;

/**
 * Parse a single rendered progress segment into structured progress.
 * Returns null when the line contains no recognizable progress.
 */
export function parseProgressLine(rawLine: string): JobProgress | null {
  const line = stripAnsi(rawLine).trim();
  if (!line) return null;

  const percentMatch = line.match(PERCENT);
  const transferMatch = line.match(TRANSFER);
  if (!percentMatch && !transferMatch) return null;

  const progress: JobProgress = { percent: 0 };

  if (transferMatch) {
    progress.current = parseSize(transferMatch[1], transferMatch[2]);
    progress.total = parseSize(transferMatch[3], transferMatch[4]);
  }

  if (percentMatch) {
    progress.percent = clampPercent(Number.parseFloat(percentMatch[1]));
  } else if (
    progress.current !== undefined &&
    progress.total &&
    progress.total > 0
  ) {
    progress.percent = clampPercent((progress.current / progress.total) * 100);
  }

  const speedMatch = line.match(SPEED);
  if (speedMatch) {
    progress.speed = parseSize(speedMatch[1], speedMatch[2]);
  }

  const etaMatch = line.match(ETA);
  if (etaMatch) {
    progress.etaSeconds = parseDuration(etaMatch[1]);
  }

  return progress;
}

function clampPercent(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

/**
 * Split a raw stdout/stderr chunk into the individual rendered segments.
 * Progress bars overwrite themselves using carriage returns, so we split on
 * both `\r` and `\n` and keep only the latest meaningful segment per render.
 */
export function splitRenderSegments(chunk: string): string[] {
  return chunk
    .split(/[\r\n]+/)
    .map((segment) => segment.trim())
    .filter(Boolean);
}
