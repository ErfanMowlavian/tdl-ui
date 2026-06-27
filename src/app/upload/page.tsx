import { PageHeader } from "@/components/page-header";
import { ComingSoon } from "@/components/coming-soon";

export default function UploadPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Upload"
        description="Upload local files to Telegram with progress and per-file status."
      />
      <ComingSoon phase="Phase 6 — Upload & forward">
        Select local files and upload them to a chat, tracked alongside your
        other jobs.
      </ComingSoon>
    </div>
  );
}
