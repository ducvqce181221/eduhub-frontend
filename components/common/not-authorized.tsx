import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export function NotAuthorized() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 bg-canvas-soft">
      <div className="w-16 h-16 rounded-full bg-sticker-orange/10 text-sticker-orange flex items-center justify-center mb-6 border border-sticker-orange/20">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-ink mb-2">
        Access Denied (403)
      </h1>
      <p className="text-ink-muted max-w-md mb-8 text-sm leading-relaxed">
        You do not have permission to access this resource. Please contact your platform
        administrator if you believe this is an error.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-notion-blue text-white text-sm font-medium hover:bg-notion-blue-active transition-colors shadow-xs"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Home
      </Link>
    </div>
  );
}
