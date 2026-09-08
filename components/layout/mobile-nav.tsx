"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { useCategoriesQuery } from "@/hooks/use-course-catalog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  BookOpen,
  Compass,
  LayoutDashboard,
  Shield,
  LogIn,
  UserPlus,
  LayoutGrid,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/language-context";
import { LocalizedLink } from "@/components/common/localized-link";
import { LanguageSelector } from "@/components/common/language-selector";
import { stripLocale } from "@/lib/auth/redirect-utils";

import type { User } from "@/types/api";

export function MobileNav({ initialUser = null }: { initialUser?: User | null }) {
  const [open, setOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const { t, language } = useTranslation();
  const { data: categories = [] } = useCategoriesQuery();

  const close = () => setOpen(false);
  const currentUser = user || initialUser;
  const isAuthed = isAuthenticated || Boolean(currentUser);
  const cleanPath = stripLocale(pathname || "/");

  const handleSearchSubmit = (term: string) => {
    if (term.trim()) {
      router.push(`/${language}?search=${encodeURIComponent(term.trim())}#catalog`);
    } else {
      router.push(`/${language}#catalog`);
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
            {t.common.appName}
          </SheetTitle>
        </SheetHeader>

        {/* Mobile Search Input */}
        <div className="mt-4">
          <SearchInput
            placeholder={t.catalog.searchFilterPlaceholder}
            value={mobileSearch}
            onSearch={(term) => {
              setMobileSearch(term);
              handleSearchSubmit(term);
            }}
            className="bg-canvas-soft"
          />
        </div>

        <div className="flex flex-col gap-1 py-4">
          <LocalizedLink
            href="/#catalog"
            onClick={close}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
              cleanPath === "/"
                ? "bg-canvas-soft text-ink font-semibold border border-hairline"
                : "text-ink-secondary hover:bg-canvas-soft hover:text-ink"
            }`}
          >
            <Compass className="h-4 w-4 text-notion-blue" />
            {t.catalog.fullCurriculum}
          </LocalizedLink>

          {/* Categories Quick List */}
          {categories.length > 0 && (
            <div className="pt-2 pb-1">
              <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink-faint flex items-center gap-1.5">
                <LayoutGrid className="w-3.5 h-3.5" />
                {t.nav.categories}
              </div>
              <div className="flex flex-col gap-0.5 mt-1 max-h-44 overflow-y-auto">
                {categories.map((cat) => (
                  <LocalizedLink
                    key={cat.id}
                    href={`/?categoryId=${encodeURIComponent(cat.id)}#catalog`}
                    onClick={close}
                    className="flex items-center justify-between px-3 py-1.5 rounded-md text-xs text-ink-secondary hover:bg-canvas-soft transition-colors"
                  >
                    <span className="truncate">{cat.name}</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                      {(cat as any)._count?.courses ?? 0}
                    </Badge>
                  </LocalizedLink>
                ))}
              </div>
            </div>
          )}

          {isAuthed ? (
            <>
              {currentUser?.role === "STUDENT" && (
                <LocalizedLink
                  href="/me/enrollments"
                  onClick={close}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    cleanPath === "/me/enrollments"
                      ? "bg-canvas-soft text-ink font-semibold border border-hairline"
                      : "text-ink-secondary hover:bg-canvas-soft hover:text-ink"
                  }`}
                >
                  <BookOpen className="h-4 w-4" />
                  {t.nav.myLearning}
                </LocalizedLink>
              )}

              {(currentUser?.role === "TEACHER" || currentUser?.role === "ADMIN") && (
                <LocalizedLink
                  href="/teacher"
                  onClick={close}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    cleanPath.startsWith("/teacher")
                      ? "bg-canvas-soft text-ink font-semibold border border-hairline"
                      : "text-ink-secondary hover:bg-canvas-soft hover:text-ink"
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {t.nav.teacherDashboard}
                </LocalizedLink>
              )}

              {currentUser?.role === "ADMIN" && (
                <LocalizedLink
                  href="/admin"
                  onClick={close}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    cleanPath.startsWith("/admin")
                      ? "bg-canvas-soft text-ink font-semibold border border-hairline"
                      : "text-ink-secondary hover:bg-canvas-soft hover:text-ink"
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  {t.nav.adminPanel}
                </LocalizedLink>
              )}
            </>
          ) : (
            <div className="pt-4 border-t border-hairline flex flex-col gap-2 mt-4">
              <LocalizedLink
                href="/login"
                onClick={close}
                className="flex items-center justify-center gap-2 w-full py-2 rounded-md border border-hairline text-xs font-medium text-ink-secondary hover:bg-canvas-soft"
              >
                <LogIn className="h-4 w-4" />
                {t.nav.login}
              </LocalizedLink>
              <LocalizedLink
                href="/register"
                onClick={close}
                className="flex items-center justify-center gap-2 w-full py-2 rounded-full bg-notion-blue text-white text-xs font-semibold hover:bg-notion-blue-active"
              >
                <UserPlus className="h-4 w-4" />
                {t.nav.register}
              </LocalizedLink>
            </div>
          )}

          {/* Settings: Language */}
          <div className="pt-4 border-t border-hairline mt-6 flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">
              {t.common.language}
            </span>
            <LanguageSelector align="start" />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
