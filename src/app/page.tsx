import Link from "next/link";
import {
  ArrowRightIcon,
  DownloadIcon,
  KeyRoundIcon,
  MessagesSquareIcon,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const quickLinks = [
  {
    title: "Log in",
    description: "Connect a Telegram session via QR or desktop import.",
    href: "/login",
    icon: KeyRoundIcon,
  },
  {
    title: "Download",
    description: "Pull files from message links or whole chats.",
    href: "/download",
    icon: DownloadIcon,
  },
  {
    title: "Browse chats",
    description: "List chats and export message metadata to JSON.",
    href: "/chats",
    icon: MessagesSquareIcon,
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description="A local control panel for the tdl Telegram toolkit."
        actions={
          <Badge variant="outline" className="gap-1.5">
            <span className="bg-muted-foreground size-1.5 rounded-full" />
            No session connected
          </Badge>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((link) => (
          <Card key={link.href} className="flex flex-col">
            <CardHeader>
              <div className="bg-primary/10 text-primary mb-2 flex size-9 items-center justify-center rounded-lg">
                <link.icon className="size-5" />
              </div>
              <CardTitle>{link.title}</CardTitle>
              <CardDescription>{link.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <Button
                variant="secondary"
                size="sm"
                render={<Link href={link.href} />}
              >
                Open
                <ArrowRightIcon className="size-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting started</CardTitle>
          <CardDescription>
            tdl-ui drives the{" "}
            <code className="bg-muted rounded px-1 py-0.5 text-xs">tdl</code>{" "}
            command-line tool on this machine. Make sure it is installed and on
            your PATH, then connect a session to begin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button size="sm" render={<Link href="/login" />}>
            <KeyRoundIcon className="size-4" />
            Connect a session
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
