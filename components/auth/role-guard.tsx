"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { NotAuthorized } from "@/components/common/not-authorized";
import type { Role } from "@/types/api";

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

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !isAuthenticated) {
      const returnUrl = encodeURIComponent(pathname || "/");
      router.push(`/login?returnUrl=${returnUrl}`);
    } else if (guestOnly && isAuthenticated) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, requireAuth, guestOnly, pathname, router]);

  if (isLoading) {
    return (
      <div
        data-testid="auth-loading-state"
        className="min-h-1/2 flex flex-col items-center justify-center"
      >
        <div className="size-8 border-2 border-hairline border-t-notion-blue rounded-full animate-spin" />
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (guestOnly && isAuthenticated) {
    return null;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <NotAuthorized />;
  }

  return <>{children}</>;
}
