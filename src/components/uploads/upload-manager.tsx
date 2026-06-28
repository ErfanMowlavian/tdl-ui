import { UploadForm } from "@/components/uploads/upload-form";
import { JobsList } from "@/components/downloads/jobs-list";
import type { SessionInfo } from "@/lib/sessions/types";
import type { Job } from "@/lib/tdl/types";

export function UploadManager({
  initialSessions,
  initialJobs,
}: {
  initialSessions: SessionInfo[];
  initialJobs: Job[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <UploadForm initialSessions={initialSessions} />
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Jobs</h2>
        <JobsList initialJobs={initialJobs} />
      </div>
    </div>
  );
}
