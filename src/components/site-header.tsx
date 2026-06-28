"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { footerNav, navGroups } from "@/lib/nav";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { GitHubIcon } from "@/components/icons";

const allItems = [...navGroups.flatMap((g) => g.items), ...footerNav];

function usePageTitle() {
  const pathname = usePathname();
  const match = allItems
    .filter((i) =>
      i.href === "/" ? pathname === "/" : pathname.startsWith(i.href),
    )
    .sort((a, b) => b.href.length - a.href.length)[0];
  return match?.title ?? "tdl-ui";
}

export function SiteHeader() {
  const title = usePageTitle();

  return (
    <header className="bg-background/80 sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b backdrop-blur">
      <div className="flex w-full items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-1 h-4" />
        <h1 className="text-sm font-medium">{title}</h1>
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="GitHub repository"
            nativeButton={false}
            render={
              <Link
                href="https://github.com/ErfanMowlavian/tdl-ui"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <GitHubIcon className="size-4" />
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
