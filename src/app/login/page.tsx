import { PageHeader } from "@/components/page-header";
import { ComingSoon } from "@/components/coming-soon";

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Login"
        description="Connect a Telegram session with QR login or desktop import, and manage session namespaces."
      />
      <ComingSoon phase="Phase 3 — Login & sessions">
        QR login and desktop session import will be wired up here, backed by the
        tdl adapter.
      </ComingSoon>
    </div>
  );
}
