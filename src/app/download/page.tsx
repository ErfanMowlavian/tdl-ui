import { PageHeader } from "@/components/page-header";
import { ComingSoon } from "@/components/coming-soon";

export default function DownloadPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Download"
        description="Download files from message links or whole chats, with threads, filters, and live progress."
      />
      <ComingSoon phase="Phase 4 — Download">
        Queue downloads from links or exports, tune concurrency and filters, and
        watch live progress streamed from tdl.
      </ComingSoon>
    </div>
  );
}
