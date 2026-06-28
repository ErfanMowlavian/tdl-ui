import { PageHeader } from "@/components/page-header";
import { DownloadManager } from "@/components/downloads/download-manager";
import { getSessionService } from "@/lib/sessions/service";
import { getJobManager } from "@/lib/jobs/manager";

export const dynamic = "force-dynamic";

export default async function DownloadPage() {
  const sessions = getSessionService().listSessions();
  const jobs = getJobManager().list();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Download"
        description="Download files from message links or whole chats, with threads, filters, and live progress."
      />
      <DownloadManager initialSessions={sessions} initialJobs={jobs} />
    </div>
  );
}
