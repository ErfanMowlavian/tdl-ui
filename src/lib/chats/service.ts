import { getAdapter } from "@/lib/tdl/adapter";
import type { Job, TdlAdapter } from "@/lib/tdl/types";
import type { Chat } from "@/lib/chats/types";
import { getJobManager } from "@/lib/jobs/manager";

export function parseChatList(lines: string[]): Chat[] {
  for (const line of lines) {
    try {
      const parsed = JSON.parse(line);
      if (Array.isArray(parsed)) {
        return parsed.map(
          (item: { id?: string; type?: string; title?: string }) => ({
            id: String(item.id ?? ""),
            type: String(item.type ?? ""),
            title: String(item.title ?? ""),
          }),
        );
      }
    } catch {
      continue;
    }
  }
  return [];
}

export class ChatService {
  constructor(private readonly adapter: TdlAdapter = getAdapter()) {}

  async listChats(namespace: string): Promise<Chat[]> {
    const lines: string[] = [];
    const handle = this.adapter.run({
      args: ["chat", "ls", "-n", namespace],
      onLog: (line) => lines.push(line),
    });
    const result = await handle.done;
    if (result.code !== 0) return [];
    return parseChatList(lines);
  }

  startExport(namespace: string, chatId: string): Job {
    return getJobManager().create({
      kind: "export",
      title: `Export chat ${chatId}`,
      args: [
        "chat",
        "export",
        "-c",
        chatId,
        "-n",
        namespace,
        "-o",
        `export-${chatId}.json`,
      ],
      namespace,
    });
  }
}

const globalForService = globalThis as unknown as {
  __chatService?: ChatService;
};

export function getChatService(): ChatService {
  globalForService.__chatService ??= new ChatService();
  return globalForService.__chatService;
}
