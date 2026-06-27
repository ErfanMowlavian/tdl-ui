import { PageHeader } from "@/components/page-header";
import { ComingSoon } from "@/components/coming-soon";

export default function ForwardPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Forward"
        description="Forward messages between chats with automatic fallback and routing."
      />
      <ComingSoon phase="Phase 6 — Upload & forward">
        Route messages from one chat to another, with the same job tracking as
        downloads and uploads.
      </ComingSoon>
    </div>
  );
}
