import { PageHeader } from "@/components/page-header";
import { ForwardManager } from "@/components/forwards/forward-manager";
import { getSessionService } from "@/lib/sessions/service";
import { getJobManager } from "@/lib/jobs/manager";

export const dynamic = "force-dynamic";

export default async function ForwardPage() {
  const sessions = getSessionService().listSessions();
  const jobs = getJobManager().list();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Forward"
        description="Forward messages between chats with automatic fallback and routing."
      />
      <ForwardManager initialSessions={sessions} initialJobs={jobs} />
    </div>
  );
}
