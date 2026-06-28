import { PageHeader } from "@/components/page-header";
import { UploadManager } from "@/components/uploads/upload-manager";
import { getSessionService } from "@/lib/sessions/service";
import { getJobManager } from "@/lib/jobs/manager";

export const dynamic = "force-dynamic";

export default async function UploadPage() {
  const sessions = getSessionService().listSessions();
  const jobs = getJobManager().list();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Upload"
        description="Upload local files to Telegram with progress and per-file status."
      />
      <UploadManager initialSessions={sessions} initialJobs={jobs} />
    </div>
  );
}
