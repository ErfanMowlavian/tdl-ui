import { z } from "zod";

import { namespaceSchema } from "@/lib/sessions/validation";

export const uploadSchema = z.object({
  namespace: namespaceSchema,
  paths: z
    .array(z.string().trim().min(1, "File path must not be empty"))
    .min(1, "At least one file path is required"),
  chat: z.string().optional(),
  removeAfter: z.boolean().optional(),
});

export type UploadRequest = z.infer<typeof uploadSchema>;

export function buildUploadArgs(input: UploadRequest): string[] {
  const args: string[] = ["up", "-n", input.namespace];

  for (const path of input.paths) args.push("-p", path);
  if (input.chat) args.push("-c", input.chat);
  if (input.removeAfter) args.push("--rm");

  return args;
}
