"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User as UserIcon, KeyRound, LogOut, BookOpen, LayoutDashboard, Shield } from "lucide-react";
import { useTranslation } from "@/lib/i18n/language-context";
import { LocalizedLink } from "@/components/common/localized-link";

import type { User } from "@/types/api";

export function UserMenu({ initialUser }: { initialUser?: User | null }) {
  const router = useRouter();
  const { user: authUser, logout } = useAuth();
  const { t, language } = useTranslation();
  const user = authUser || initialUser;

  if (!user) return null;

  const initials = user.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    await logout();
    router.push(`/${language}/login`);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "admin" as const;
      case "TEACHER":
        return "teacher" as const;
      default:
        return "student" as const;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none rounded-full ring-offset-2 focus:ring-2 focus:ring-notion-blue/30">
        <div className="flex items-center gap-2 p-1 rounded-full hover:bg-canvas-soft transition-colors cursor-pointer">
          <Avatar className="h-8 w-8 border border-hairline">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.fullName} />}
            <AvatarFallback className="bg-notion-blue text-white text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:inline-block text-sm font-medium text-ink-secondary pr-1">
            {user.fullName}
          </span>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56 bg-surface border border-hairline shadow-notion-dropdown rounded-lg p-1" align="end" forceMount>
        <DropdownMenuLabel className="font-normal px-2.5 py-2">
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold leading-none text-ink truncate">{user.fullName}</p>
              <Badge variant={getRoleBadgeVariant(user.role)} className="text-[10px] px-1.5 py-0 h-4 shrink-0 font-medium">
                {t.enums.role[user.role] || user.role}
              </Badge>
            </div>
            <p className="text-[11px] leading-none text-ink-muted truncate">{user.email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-hairline my-1" />

        <DropdownMenuGroup className="space-y-0.5">
          {user.role === "ADMIN" && (
            <DropdownMenuItem asChild>
              <LocalizedLink href="/admin" className="cursor-pointer flex items-center text-xs font-medium text-ink-secondary hover:text-ink hover:bg-canvas-soft rounded-md px-2.5 py-1.5">
                <Shield className="mr-2 h-3.5 w-3.5 text-ink-muted" />
                <span>{t.nav.adminPanel}</span>
              </LocalizedLink>
            </DropdownMenuItem>
          )}

          {(user.role === "TEACHER" || user.role === "ADMIN") && (
            <DropdownMenuItem asChild>
              <LocalizedLink href="/teacher" className="cursor-pointer flex items-center text-xs font-medium text-ink-secondary hover:text-ink hover:bg-canvas-soft rounded-md px-2.5 py-1.5">
                <LayoutDashboard className="mr-2 h-3.5 w-3.5 text-ink-muted" />
                <span>{t.nav.teacherDashboard}</span>
              </LocalizedLink>
            </DropdownMenuItem>
          )}

          {user.role === "STUDENT" && (
            <DropdownMenuItem asChild>
              <LocalizedLink href="/me/enrollments" className="cursor-pointer flex items-center text-xs font-medium text-ink-secondary hover:text-ink hover:bg-canvas-soft rounded-md px-2.5 py-1.5">
                <BookOpen className="mr-2 h-3.5 w-3.5 text-ink-muted" />
                <span>{t.nav.myLearning}</span>
              </LocalizedLink>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem asChild>
            <LocalizedLink href="/profile" className="cursor-pointer flex items-center text-xs font-medium text-ink-secondary hover:text-ink hover:bg-canvas-soft rounded-md px-2.5 py-1.5">
              <UserIcon className="mr-2 h-3.5 w-3.5 text-ink-muted" />
              <span>{t.nav.profile}</span>
            </LocalizedLink>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <LocalizedLink href="/change-password" className="cursor-pointer flex items-center text-xs font-medium text-ink-secondary hover:text-ink hover:bg-canvas-soft rounded-md px-2.5 py-1.5">
              <KeyRound className="mr-2 h-3.5 w-3.5 text-ink-muted" />
              <span>{t.nav.changePassword}</span>
            </LocalizedLink>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-hairline my-1" />

        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-xs font-medium text-sticker-orange-deep hover:text-sticker-orange hover:bg-sticker-orange/10 focus:text-sticker-orange focus:bg-sticker-orange/10 rounded-md px-2.5 py-1.5"
        >
          <LogOut className="mr-2 h-3.5 w-3.5" />
          <span>{t.nav.logout}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
