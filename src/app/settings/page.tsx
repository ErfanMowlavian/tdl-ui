import { PageHeader } from "@/components/page-header";
import { ComingSoon } from "@/components/coming-soon";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Configure the tdl binary path, default download directory, concurrency, and appearance."
      />
      <ComingSoon phase="Phase 2 — tdl adapter">
        Detect the tdl binary, set defaults, and review environment status.
      </ComingSoon>
    </div>
  );
}
