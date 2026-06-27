import {
  Download,
  Forward,
  KeyRound,
  LayoutDashboard,
  MessagesSquare,
  Settings,
  Upload,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", href: "/", icon: LayoutDashboard }],
  },
  {
    label: "Telegram",
    items: [
      { title: "Login", href: "/login", icon: KeyRound },
      { title: "Download", href: "/download", icon: Download },
      { title: "Chats", href: "/chats", icon: MessagesSquare },
      { title: "Upload", href: "/upload", icon: Upload },
      { title: "Forward", href: "/forward", icon: Forward },
    ],
  },
];

export const footerNav: NavItem[] = [
  { title: "Settings", href: "/settings", icon: Settings },
];
