"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { NotAuthorized } from "@/components/common/not-authorized";
import type { Role } from "@/types/api";

import { Skeleton } from "@/components/ui/skeleton";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
  requireAuth?: boolean;
  guestOnly?: boolean;
}

export function RoleGuard({
  children,
  allowedRoles,
  requireAuth = false,
  guestOnly = false,
}: RoleGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();

  const isUserAuthenticated = isAuthenticated || Boolean(user);

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !isUserAuthenticated) {
      const returnUrl = encodeURIComponent(pathname || "/");
      router.push(`/login?returnUrl=${returnUrl}`);
    } else if (guestOnly && isUserAuthenticated) {
      router.push("/");
    }
  }, [isLoading, isUserAuthenticated, requireAuth, guestOnly, pathname, router]);

  if (isLoading && !user) {
    return (
      <div
        data-testid="auth-loading-state"
        className="flex flex-col flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6"
      >
        {/* Header Banner Skeleton */}
        <div className="flex flex-col gap-3 py-4 border-b border-hairline">
          <Skeleton className="h-5 w-32 rounded-full" />
          <Skeleton className="h-8 w-64 rounded-lg" />
          <Skeleton className="h-4 w-96 rounded-md" />
        </div>

        {/* Grid Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-surface border border-hairline flex flex-col gap-4 shadow-notion-soft"
            >
              <Skeleton className="aspect-video w-full rounded-xl" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-24 rounded-full" />
                <Skeleton className="h-5 w-full rounded-md" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
              </div>
              <div className="pt-2 mt-auto border-t border-hairline flex justify-between items-center">
                <Skeleton className="h-4 w-20 rounded-md" />
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (requireAuth && !isUserAuthenticated) {
    return null;
  }

  if (guestOnly && isUserAuthenticated) {
    return null;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <NotAuthorized />;
  }

  return <>{children}</>;
}
