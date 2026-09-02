"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, BookOpen, Compass, LayoutDashboard, Shield, LogIn, UserPlus } from "lucide-react";

import type { User } from "@/types/api";

export function MobileNav({ initialUser = null }: { initialUser?: User | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  const close = () => setOpen(false);
  const currentUser = user || initialUser;
  const isAuthed = isAuthenticated || Boolean(currentUser);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Navigation Menu</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-70 sm:w-80 bg-surface border-r border-hairline">
        <SheetHeader>
          <SheetTitle className="text-left font-bold text-lg text-ink flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-notion-blue text-white flex items-center justify-center text-xs font-bold">
              E
            </span>
            EduHub
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-1 py-6">
          <Link
            href="/courses"
            onClick={close}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/courses"
                ? "bg-black/5 text-ink font-semibold"
                : "text-ink-secondary hover:bg-black/5 hover:text-ink"
            }`}
          >
            <Compass className="h-4 w-4" />
            Browse Courses
          </Link>

          {isAuthed ? (
            <>
              <Link
                href="/me/enrollments"
                onClick={close}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === "/me/enrollments"
                    ? "bg-black/5 text-ink font-semibold"
                    : "text-ink-secondary hover:bg-black/5 hover:text-ink"
                }`}
              >
                <BookOpen className="h-4 w-4" />
                My Enrollments
              </Link>

              {(currentUser?.role === "TEACHER" || currentUser?.role === "ADMIN") && (
                <Link
                  href="/teacher"
                  onClick={close}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname?.startsWith("/teacher")
                      ? "bg-black/5 text-ink font-semibold"
                      : "text-ink-secondary hover:bg-black/5 hover:text-ink"
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Teacher Dashboard
                </Link>
              )}

              {currentUser?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={close}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname?.startsWith("/admin")
                      ? "bg-black/5 text-ink font-semibold"
                      : "text-ink-secondary hover:bg-black/5 hover:text-ink"
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  Admin Panel
                </Link>
              )}
            </>
          ) : (
            <div className="pt-4 border-t border-hairline flex flex-col gap-2 mt-4">
              <Link
                href="/login"
                onClick={close}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-hairline text-sm font-medium text-ink-secondary hover:bg-canvas-soft"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={close}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-notion-blue text-white text-sm font-medium hover:bg-notion-blue-active"
              >
                <UserPlus className="h-4 w-4" />
                Get Started
              </Link>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
