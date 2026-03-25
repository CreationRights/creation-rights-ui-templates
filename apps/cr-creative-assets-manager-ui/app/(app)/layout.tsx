"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import {
  Image,
  Upload,
  Download,
  Shield,
  Clock,
  Sun,
  Moon,
  Bell,
  ArrowLeft,
  Layers,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RoleProvider, useRole } from "@/lib/role-context";
import type { UserRole } from "@/lib/mock-data";

const NAV_ITEMS = [
  { href: "/", label: "Library", icon: Image },
  { href: "/upload", label: "Upload", icon: Upload, adminOnly: true },
  { href: "/exports", label: "Exports", icon: Download },
  { href: "/legal-holds", label: "Legal Holds", icon: Shield },
  { href: "/activity", label: "Activity Log", icon: Clock },
];

const ROLES: UserRole[] = [
  "admin",
  "manager",
  "editor",
  "viewer",
  "compliance_officer",
];

function DarkModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-md hover:bg-muted transition-colors"
      aria-label="Toggle theme"
    >
      {mounted ? (
        theme === "dark" ? (
          <Sun className="size-4 text-muted-foreground" />
        ) : (
          <Moon className="size-4 text-muted-foreground" />
        )
      ) : (
        <div className="size-4" />
      )}
    </button>
  );
}

function SidebarContent() {
  const pathname = usePathname();
  const { role, setRole, can } = useRole();

  const visibleNav = NAV_ITEMS.filter((item) => {
    if (item.adminOnly && !can("upload")) return false;
    return true;
  });

  return (
    <aside className="w-56 h-full flex flex-col border-r border-border bg-sidebar shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-border">
        <div className="size-7 rounded-md bg-foreground flex items-center justify-center shrink-0">
          <Layers className="size-4 text-background" />
        </div>
        <span className="font-semibold text-sm tracking-tight text-sidebar-foreground">
          Creative Assets
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 flex flex-col gap-0.5 overflow-y-auto">
        {visibleNav.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 h-9 px-3 rounded-lg text-[13px] transition-colors border-l-2",
                active
                  ? "border-foreground bg-muted text-sidebar-foreground font-medium"
                  : "border-transparent text-muted-foreground hover:text-sidebar-foreground hover:bg-muted/50"
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border px-4 py-3 flex flex-col gap-3">
        {/* Storage quota */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Storage</span>
            <span className="text-xs text-muted-foreground">14.2 / 50 GB</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-foreground rounded-full"
              style={{ width: "28.4%" }}
            />
          </div>
        </div>

        {/* Role selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center justify-between gap-2 w-full px-2 py-1.5 rounded-md hover:bg-muted transition-colors text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Avatar className="size-5">
                  <AvatarFallback className="bg-muted text-muted-foreground text-[10px]">
                    SC
                  </AvatarFallback>
                </Avatar>
                <span className="capitalize">{role.replace("_", " ")}</span>
              </div>
              <ChevronDown className="size-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-44">
            {ROLES.map((r) => (
              <DropdownMenuItem
                key={r}
                onClick={() => setRole(r)}
                className={cn(
                  "capitalize text-xs",
                  role === r && "font-medium bg-muted"
                )}
              >
                {r.replace("_", " ")}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

function StandaloneBar() {
  return (
    <header className="h-14 w-full px-4 flex items-center justify-between border-b border-border bg-background shrink-0">
      <Link
        href="#"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Return to Creation Rights
      </Link>
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium text-foreground mr-2">
          Creative Assets
        </span>
        <button className="relative p-2 rounded-md hover:bg-muted transition-colors">
          <Bell className="size-4 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 size-1.5 bg-red-500 rounded-full" />
        </button>
        <DarkModeToggle />
        <Avatar className="size-8 ml-1">
          <AvatarFallback className="bg-muted text-muted-foreground text-xs">
            SC
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

function InlineTopBar() {
  return (
    <div className="absolute top-3 right-4 flex items-center gap-1 z-10">
      <DarkModeToggle />
    </div>
  );
}

function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const standalone = searchParams.get("standalone") === "true";

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      {standalone && <StandaloneBar />}
      <div className="flex flex-1 overflow-hidden relative">
        {!standalone && <InlineTopBar />}
        <SidebarContent />
        <main className="flex-1 h-full bg-background overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <Suspense fallback={null}>
        <AppLayoutInner>{children}</AppLayoutInner>
      </Suspense>
    </RoleProvider>
  );
}
