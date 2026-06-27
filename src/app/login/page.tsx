import { PageHeader } from "@/components/page-header";
import { SessionsManager } from "@/components/sessions/sessions-manager";
import { getSessionService } from "@/lib/sessions/service";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const sessions = getSessionService().listSessions();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Login"
        description="Connect Telegram sessions with QR login or desktop import, and manage their namespaces."
      />
      <SessionsManager initialSessions={sessions} />
    </div>
  );
}
