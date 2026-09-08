"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { UserMenu } from "@/components/layout/user-menu";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ExploreMenu } from "@/components/layout/explore-menu";
import { HeaderSearch } from "@/components/layout/header-search";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { LanguageSelector } from "@/components/common/language-selector";
import { useTranslation } from "@/lib/i18n/language-context";
import { LocalizedLink } from "@/components/common/localized-link";
import { stripLocale } from "@/lib/auth/redirect-utils";

import type { User } from "@/types/api";

export function Header({ initialUser = null }: { initialUser?: User | null }) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const currentUser = user || initialUser;
  const isAuthed = isAuthenticated || Boolean(currentUser);
  const cleanPath = stripLocale(pathname || "/");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-hairline bg-surface">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left: Brand + Explore Menu */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <LocalizedLink href="/" className="flex items-center gap-2.5 font-bold text-base text-ink">
            <span className="w-7 h-7 rounded-md bg-notion-blue text-white flex items-center justify-center text-xs font-bold shadow-2xs">
              E
            </span>
            <span className="tracking-tight text-base font-bold hidden xs:inline">{t.common.appName}</span>
          </LocalizedLink>

          <ExploreMenu />
        </div>

        {/* Center: Global Course Search */}
        <div className="hidden sm:flex flex-1 justify-center max-w-md lg:max-w-lg mx-2">
          <React.Suspense fallback={<div className="w-full h-9 bg-canvas-soft rounded-md animate-pulse border border-hairline" />}>
            <HeaderSearch />
          </React.Suspense>
        </div>

        {/* Desktop Navigation Links & Role Dashboards */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-ink-secondary">
            {isAuthed && currentUser?.role === "STUDENT" && (
              <LocalizedLink
                href="/me/enrollments"
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  cleanPath === "/me/enrollments"
                    ? "bg-canvas-soft text-ink font-semibold border border-hairline"
                    : "hover:bg-canvas-soft hover:text-ink text-ink-secondary"
                }`}
              >
                {t.nav.myLearning}
              </LocalizedLink>
            )}

            {isAuthed && (currentUser?.role === "TEACHER" || currentUser?.role === "ADMIN") && (
              <LocalizedLink
                href="/teacher"
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  cleanPath.startsWith("/teacher")
                    ? "bg-canvas-soft text-ink font-semibold border border-hairline"
                    : "hover:bg-canvas-soft hover:text-ink text-ink-secondary"
                }`}
              >
                {t.nav.teacherDashboard}
              </LocalizedLink>
            )}

            {isAuthed && currentUser?.role === "ADMIN" && (
              <LocalizedLink
                href="/admin"
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  cleanPath === "/admin" || cleanPath.startsWith("/admin/")
                    ? "bg-canvas-soft text-ink font-semibold border border-hairline"
                    : "hover:bg-canvas-soft hover:text-ink text-ink-secondary"
                }`}
              >
                {t.nav.adminPanel}
              </LocalizedLink>
            )}
          </nav>
        </div>

        {/* Right: Theme + Language + Auth State / Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 border-r border-hairline pr-2 sm:pr-3">
            <LanguageSelector />
            <ThemeToggle />
          </div>

          {isAuthed && currentUser ? (
            <div className="flex items-center gap-2">
              <NotificationBell />
              <UserMenu initialUser={currentUser} />
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <LocalizedLink href="/login" className="text-ink-secondary hover:text-ink">
                  {t.nav.login}
                </LocalizedLink>
              </Button>
              <Button
                size="sm"
                variant="pill"
                asChild
              >
                <LocalizedLink href="/register">{t.nav.register}</LocalizedLink>
              </Button>
            </div>
          )}

          {/* Mobile Navigation Trigger */}
          <MobileNav initialUser={currentUser} />
        </div>
      </div>
    </header>
  );
}
