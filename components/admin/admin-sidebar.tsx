"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  FolderTree,
  BookOpen,
  Megaphone,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Categories", href: "/admin/categories", icon: FolderTree },
  { name: "Course Oversight", href: "/admin/courses", icon: BookOpen },
  { name: "System Broadcast", href: "/admin/notifications", icon: Megaphone },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const getInitials = (name?: string) => {
    if (!name) return "AD";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside className="flex min-h-dvh w-64 flex-col justify-between border-r border-hairline bg-canvas-soft p-4 select-none">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-notion-blue text-white">
            <ShieldCheck className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-ink">
              EduHub Admin
            </span>
            <p className="text-[11px] text-ink-muted">
              Platform Control Center
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
            Management
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition-colors ${isActive
                    ? "bg-surface text-ink font-semibold border border-hairline shadow-2xs"
                    : "text-ink-secondary hover:bg-surface/70 hover:text-ink"
                  }`}
              >
                <Icon
                  className={`h-4 w-4 ${isActive ? "text-notion-blue" : "text-ink-muted"
                    }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Section */}
      <div className="space-y-3 pt-4 border-t border-hairline">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium text-ink-secondary transition-colors hover:bg-surface/70 hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-ink-muted" />
          <span>Back to App</span>
        </Link>

        {/* Current Admin Card */}
        {user && (
          <div className="flex items-center gap-2.5 rounded-lg border border-hairline bg-surface p-2.5">
            <Avatar className="h-7 w-7 rounded-full border border-hairline">
              {user.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={user.fullName} />
              ) : (
                <AvatarFallback className="text-[10px] font-bold text-ink bg-canvas-soft">
                  {getInitials(user.fullName)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <p className="truncate text-xs font-semibold text-ink">
                  {user.fullName}
                </p>
                <Badge
                  variant="admin"
                  className="text-[10px] px-1.5 py-0 h-4 font-medium shrink-0"
                >
                  {user.role}
                </Badge>
              </div>
              <p className="truncate text-[10px] text-ink-muted">
                {user.email}
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
