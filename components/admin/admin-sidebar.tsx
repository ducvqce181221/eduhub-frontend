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
    <aside className="flex h-screen w-64 flex-col justify-between border-r border-neutral-200 bg-[#f6f5f4] p-4 select-none">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0075de] text-white shadow-2xs">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-neutral-900">
              EduHub Admin
            </span>
            <p className="text-[11px] font-medium text-neutral-500">
              Platform Control Center
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            Management
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-neutral-200 text-neutral-900 shadow-2xs font-semibold"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    isActive ? "text-[#0075de]" : "text-neutral-500"
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Section */}
      <div className="space-y-3 pt-4 border-t border-neutral-200">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900"
        >
          <ArrowLeft className="h-4 w-4 text-neutral-400" />
          <span>Back to App</span>
        </Link>

        {/* Current Admin Card */}
        {user && (
          <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-2.5 shadow-2xs">
            <Avatar className="h-8 w-8 rounded-full border border-neutral-200">
              {user.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={user.fullName} />
              ) : (
                <AvatarFallback className="text-[11px] font-bold text-neutral-700">
                  {getInitials(user.fullName)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="truncate text-xs font-semibold text-neutral-900">
                  {user.fullName}
                </p>
                <Badge
                  variant="outline"
                  className="rounded-full border-neutral-200 bg-neutral-100 px-1.5 py-0 text-[10px] font-bold text-neutral-700"
                >
                  {user.role}
                </Badge>
              </div>
              <p className="truncate text-[11px] text-neutral-400">
                {user.email}
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
