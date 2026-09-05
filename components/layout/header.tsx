"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { UserMenu } from "@/components/layout/user-menu";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ExploreMenu } from "@/components/layout/explore-menu";
import { HeaderSearch } from "@/components/layout/header-search";
import { Button } from "@/components/ui/button";

import type { User } from "@/types/api";

export function Header({ initialUser = null }: { initialUser?: User | null }) {
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();
  const currentUser = user || initialUser;
  const isAuthed = isAuthenticated || Boolean(currentUser);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-hairline bg-surface">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left: Brand + Explore Menu */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-base text-ink">
            <span className="w-7 h-7 rounded-md bg-notion-blue text-white flex items-center justify-center text-xs font-bold">
              E
            </span>
            <span className="tracking-tight text-base font-bold hidden xs:inline">EduHub</span>
          </Link>

          <ExploreMenu />
        </div>

        {/* Center: Global Course Search */}
        <div className="hidden sm:flex flex-1 justify-center max-w-md lg:max-w-lg mx-2">
          <React.Suspense fallback={<div className="w-full h-9 bg-canvas-soft rounded-md animate-pulse border border-hairline" />}>
            <HeaderSearch />
          </React.Suspense>
        </div>

        {/* Desktop Navigation Links & User Actions */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-ink-secondary">
            {isAuthed && currentUser?.role === "STUDENT" && (
              <Link
                href="/me/enrollments"
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  pathname === "/me/enrollments"
                    ? "bg-canvas-soft text-ink font-semibold border border-hairline"
                    : "hover:bg-canvas-soft hover:text-ink text-ink-secondary"
                }`}
              >
                My Enrollments
              </Link>
            )}

            {isAuthed && (currentUser?.role === "TEACHER" || currentUser?.role === "ADMIN") && (
              <Link
                href="/teacher"
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  pathname?.startsWith("/teacher")
                    ? "bg-canvas-soft text-ink font-semibold border border-hairline"
                    : "hover:bg-canvas-soft hover:text-ink text-ink-secondary"
                }`}
              >
                Teacher Dashboard
              </Link>
            )}

            {isAuthed && currentUser?.role === "ADMIN" && (
              <Link
                href="/admin"
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  pathname?.startsWith("/admin")
                    ? "bg-canvas-soft text-ink font-semibold border border-hairline"
                    : "hover:bg-canvas-soft hover:text-ink text-ink-secondary"
                }`}
              >
                Admin Panel
              </Link>
            )}
          </nav>
        </div>

        {/* Right: Auth State / Actions */}
        <div className="flex items-center gap-3">
          {isAuthed && currentUser ? (
            <UserMenu initialUser={currentUser} />
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login" className="text-ink-secondary hover:text-ink">
                  Sign In
                </Link>
              </Button>
              <Button
                size="sm"
                variant="pill"
                asChild
              >
                <Link href="/register">Get Started</Link>
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
