import { z } from "zod";

import { namespaceSchema } from "@/lib/sessions/validation";

/** A Telegram message link (must start with https://t.me/). */
export const telegramUrlSchema = z
  .string()
  .refine(
    (value) => value.startsWith("https://t.me/"),
    "URL must be a Telegram message link (https://t.me/...)",
  );

export const downloadSchema = z.object({
  namespace: namespaceSchema,
  urls: z
    .array(telegramUrlSchema)
    .min(1, "At least one message link is required")
    .max(5, "Maximum 5 message links per download job"),
  dir: z.string().min(1).optional(),
  threads: z.coerce.number().int().min(1).max(16).optional(),
  limit: z.coerce.number().int().min(1).max(8).optional(),
  include: z.string().optional(),
  exclude: z.string().optional(),
  group: z.boolean().optional(),
  skipSame: z.boolean().optional(),
});

export type DownloadRequest = z.infer<typeof downloadSchema>;

/**
 * Builds the tdl `dl` argument array from validated request fields.
 *
 * Pure and side-effect free so it is easy to unit-test. Arguments are passed to
 * tdl as an array (never a shell string), so user input can't become a command.
 */
export function buildDownloadArgs(input: DownloadRequest): string[] {
  const args: string[] = ["dl", "-n", input.namespace];

  for (const url of input.urls) args.push("-u", url);
  if (input.dir) args.push("-d", input.dir);
  if (input.threads !== undefined) args.push("-t", String(input.threads));
  if (input.limit !== undefined) args.push("-l", String(input.limit));
  if (input.include) args.push("-i", input.include);
  if (input.exclude) args.push("-e", input.exclude);
  if (input.group) args.push("--group");
  if (input.skipSame) args.push("--skip-same");

  return args;
}
