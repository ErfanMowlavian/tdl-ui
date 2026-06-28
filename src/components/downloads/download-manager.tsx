import { DownloadForm } from "@/components/downloads/download-form";
import { JobsList } from "@/components/downloads/jobs-list";
import type { SessionInfo } from "@/lib/sessions/types";
import type { Job } from "@/lib/tdl/types";

export function DownloadManager({
  initialSessions,
  initialJobs,
}: {
  initialSessions: SessionInfo[];
  initialJobs: Job[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <DownloadForm initialSessions={initialSessions} />
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Jobs</h2>
        {/* Always mounted so its live SSE stream is active even with no jobs yet. */}
        <JobsList initialJobs={initialJobs} />
      </div>
    </div>
  );
}
