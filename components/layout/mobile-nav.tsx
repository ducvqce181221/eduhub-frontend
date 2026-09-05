"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { useCategoriesQuery } from "@/hooks/use-course-catalog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  BookOpen,
  Compass,
  LayoutDashboard,
  Shield,
  LogIn,
  UserPlus,
  Search,
  LayoutGrid,
} from "lucide-react";

import type { User } from "@/types/api";

export function MobileNav({ initialUser = null }: { initialUser?: User | null }) {
  const [open, setOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const { data: categories = [] } = useCategoriesQuery();

  const close = () => setOpen(false);
  const currentUser = user || initialUser;
  const isAuthed = isAuthenticated || Boolean(currentUser);

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileSearch.trim()) {
      router.push(`/?search=${encodeURIComponent(mobileSearch.trim())}#catalog`);
    } else {
      router.push("/#catalog");
    }
    close();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Navigation Menu</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-72 sm:w-80 bg-surface border-r border-hairline overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left font-bold text-lg text-ink flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-notion-blue text-white flex items-center justify-center text-xs font-bold">
              E
            </span>
            EduHub
          </SheetTitle>
        </SheetHeader>

        {/* Mobile Search Input */}
        <form onSubmit={handleMobileSearch} className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
            <Input
              type="search"
              placeholder="Search courses..."
              value={mobileSearch}
              onChange={(e) => setMobileSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs bg-canvas-soft border-hairline rounded-lg"
            />
          </div>
        </form>

        <div className="flex flex-col gap-1 py-4">
          <Link
            href="/#catalog"
            onClick={close}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/"
                ? "bg-black/5 text-ink font-semibold"
                : "text-ink-secondary hover:bg-black/5 hover:text-ink"
            }`}
          >
            <Compass className="h-4 w-4 text-notion-blue" />
            Course Catalog
          </Link>

          {/* Categories Quick List */}
          {categories.length > 0 && (
            <div className="pt-2 pb-1">
              <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                <LayoutGrid className="w-3.5 h-3.5" />
                Categories
              </div>
              <div className="flex flex-col gap-0.5 mt-1 max-h-44 overflow-y-auto">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/?categoryId=${encodeURIComponent(cat.id)}#catalog`}
                    onClick={close}
                    className="flex items-center justify-between px-3 py-1.5 rounded-md text-xs text-ink-secondary hover:bg-black/5 transition-colors"
                  >
                    <span className="truncate">{cat.name}</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                      {(cat as any)._count?.courses ?? 0}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {isAuthed ? (
            <>
              {currentUser?.role === "STUDENT" && (
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
              )}

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
