import { PageHeader } from "@/components/page-header";
import { ComingSoon } from "@/components/coming-soon";

export default function ChatsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Chats"
        description="Browse your chats and export message metadata to JSON, then download straight from an export."
      />
      <ComingSoon phase="Phase 5 — Browse & export chats">
        List chats, inspect them, and export message metadata that downloads can
        consume.
      </ComingSoon>
    </div>
  );
}
