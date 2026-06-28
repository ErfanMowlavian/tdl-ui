import { PageHeader } from "@/components/page-header";
import { ChatsBrowser } from "@/components/chats/chats-browser";
import { getSessionService } from "@/lib/sessions/service";

export const dynamic = "force-dynamic";

export default function ChatsPage() {
  const sessions = getSessionService().listSessions();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Chats"
        description="Browse your chats and export message metadata to JSON, then download straight from an export."
      />
      <ChatsBrowser initialSessions={sessions} />
    </div>
  );
}
