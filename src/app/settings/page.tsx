import { PageHeader } from "@/components/page-header";
import { ComingSoon } from "@/components/coming-soon";
import { TdlStatusCard } from "@/components/tdl-status-card";
import { getAdapter } from "@/lib/tdl/adapter";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const info = await getAdapter().detect();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Review the tdl environment and configure defaults."
      />
      <TdlStatusCard initialInfo={info} />
      <ComingSoon phase="Phase 4 — Download">
        Editable defaults for the binary path, download directory, and
        concurrency will live here.
      </ComingSoon>
    </div>
  );
}
