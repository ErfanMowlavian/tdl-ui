import { z } from "zod";

/**
 * Namespaces are passed to tdl as `-n <namespace>`. Even though we always spawn
 * with an argument array (so shell injection is impossible), we still constrain
 * them to a safe, filesystem-friendly shape.
 */
export const namespaceSchema = z
  .string()
  .regex(
    /^[a-zA-Z0-9_-]{1,32}$/,
    "Use 1–32 letters, numbers, dashes, or underscores",
  );

export const loginSchema = z.discriminatedUnion("method", [
  z.object({
    method: z.literal("qr"),
    namespace: namespaceSchema,
  }),
  z.object({
    method: z.literal("desktop"),
    namespace: namespaceSchema,
    desktopPath: z.string().trim().min(1).optional(),
    passcode: z.string().min(1).optional(),
  }),
]);

export type LoginRequest = z.infer<typeof loginSchema>;
