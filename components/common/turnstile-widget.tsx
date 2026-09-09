"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "@/lib/theme/theme-context";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        params: {
          sitekey: string;
          action?: string;
          callback?: (token: string) => void;
          "error-callback"?: (error: any) => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact" | "flexible";
        },
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (err: any) => void;
  action?: string;
  resetSignal?: number;
  className?: string;
}

export function TurnstileWidget({
  onVerify,
  onExpire,
  onError,
  action,
  resetSignal,
  className = "",
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { theme } = useTheme();

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

  useEffect(() => {
    // In automated testing environments (vitest / jest), no-op
    if (typeof window !== "undefined" && process.env.NODE_ENV === "test") {
      return;
    }

    if (!siteKey) {
      return;
    }


    let isSubscribed = true;

    function renderWidget() {
      if (!containerRef.current || !window.turnstile || widgetIdRef.current) {
        return;
      }

      try {
        const id = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          action: action,
          theme: theme === "dark" ? "dark" : "light",
          callback: (token: string) => {
            if (isSubscribed) {
              onVerify(token);
            }
          },
          "expired-callback": () => {
            if (isSubscribed) {
              onVerify("");
              onExpire?.();
            }
          },
          "error-callback": (err: any) => {
            if (isSubscribed) {
              onVerify("");
              onError?.(err);
            }
          },
        });
        widgetIdRef.current = id;
        setIsLoaded(true);
      } catch (e) {
        console.error("Failed to render Cloudflare Turnstile widget:", e);
      }
    }

    // Check if script already injected
    if (window.turnstile) {
      renderWidget();
    } else {
      const existingScript = document.querySelector(
        'script[src*="challenges.cloudflare.com/turnstile"]',
      );

      if (!existingScript) {
        const script = document.createElement("script");
        script.src =
          "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.onload = () => {
          if (isSubscribed) {
            renderWidget();
          }
        };
        document.head.appendChild(script);
      } else {
        const interval = setInterval(() => {
          if (window.turnstile) {
            clearInterval(interval);
            if (isSubscribed) {
              renderWidget();
            }
          }
        }, 100);

        return () => {
          isSubscribed = false;
          clearInterval(interval);
          if (widgetIdRef.current && window.turnstile) {
            try {
              window.turnstile.remove(widgetIdRef.current);
            } catch {}
            widgetIdRef.current = null;
          }
        };
      }
    }

    return () => {
      isSubscribed = false;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {}
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, theme, action, onVerify, onExpire, onError]);

  useEffect(() => {
    if (resetSignal && widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current);
        onVerify("");
      } catch (e) {
        console.error("Failed to reset Turnstile widget:", e);
      }
    }
  }, [resetSignal, onVerify]);

  if (!siteKey && process.env.NODE_ENV !== "test") {
    return null;
  }

  return (
    <div className={`flex flex-col items-center justify-center my-3 min-h-[65px] ${className}`}>
      <div ref={containerRef} className="cf-turnstile-container" />
      {!isLoaded && (
        <div className="text-[11px] text-ink-faint animate-pulse py-1">
          Secured by Cloudflare Turnstile
        </div>
      )}
    </div>
  );
}
