"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { getPostLoginRedirect } from "@/lib/auth/redirect-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import type { Role } from "@/types/api";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshSession } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function handleCallback() {
      const error = searchParams.get("error");
      const returnUrl = searchParams.get("returnUrl") || "/courses";

      if (error) {
        if (isMounted) {
          setErrorMessage(error);
          router.push(`/login?error=${encodeURIComponent(error)}`);
        }
        return;
      }

      try {
        const success = await refreshSession();
        if (success && isMounted) {
          let role: Role = "STUDENT";
          try {
            const saved = localStorage.getItem("eduhub_auth_user");
            if (saved) {
              const parsed = JSON.parse(saved);
              if (parsed.role) role = parsed.role;
            }
          } catch {
            // Ignore
          }
          const destination = getPostLoginRedirect(role, returnUrl);
          router.push(destination);
        } else if (isMounted) {
          router.push("/login?error=Failed to authenticate with Google");
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMessage(err?.message || "Failed to authenticate with Google");
          router.push("/login?error=Failed to authenticate with Google");
        }
      }
    }

    handleCallback();

    return () => {
      isMounted = false;
    };
  }, [router, searchParams, refreshSession]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-canvas-soft">
      <Card className="w-full max-w-md border-hairline shadow-notion-soft bg-surface rounded-xl p-6 text-center">
        <CardContent className="pt-6 space-y-4">
          {errorMessage ? (
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-sticker-red/10 text-sticker-red flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-semibold text-ink">Authentication Error</h2>
              <p className="text-sm text-ink-muted">{errorMessage}</p>
              <p className="text-xs text-ink-muted">Redirecting to login...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-notion-blue/10 text-notion-blue flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
              <h2 className="text-lg font-semibold text-ink">
                Authenticating with Google...
              </h2>
              <p className="text-sm text-ink-muted">
                Finalizing your secure session. You will be redirected shortly.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-canvas-soft">
          <Card className="w-full max-w-md border-hairline shadow-notion-soft bg-surface rounded-xl p-6 text-center">
            <CardContent className="pt-6 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-notion-blue" />
              <p className="text-sm text-ink-muted">Loading authentication...</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
