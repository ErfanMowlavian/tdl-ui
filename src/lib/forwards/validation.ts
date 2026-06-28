import { z } from "zod";

import { namespaceSchema } from "@/lib/sessions/validation";
import { telegramUrlSchema } from "@/lib/downloads/validation";

export const forwardSchema = z.object({
  namespace: namespaceSchema,
  from: z
    .array(telegramUrlSchema)
    .min(1, "At least one source link is required"),
  to: z.string().min(1, "Destination chat is required"),
  silent: z.boolean().optional(),
});

export type ForwardRequest = z.infer<typeof forwardSchema>;

export function buildForwardArgs(input: ForwardRequest): string[] {
  const args: string[] = ["forward", "-n", input.namespace];

  for (const from of input.from) args.push("--from", from);
  args.push("--to", input.to);
  if (input.silent) args.push("--silent");

  return args;
}
