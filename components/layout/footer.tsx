import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-hairline bg-canvas-soft mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-muted">
        <div className="flex items-center gap-2.5">
          <span className="size-5 rounded-md bg-notion-blue text-white flex items-center justify-center text-xs font-bold">
            E
          </span>
          <span className="font-semibold text-ink">EduHub</span>
          <span className="text-ink-faint">•</span>
          <span>© {new Date().getFullYear()} EduHub Platform. All rights reserved.</span>
        </div>

        <div className="flex items-center gap-5 text-ink-secondary text-xs">
          <Link href="/courses" className="hover:text-ink transition-colors">
            All Courses
          </Link>
          <Link href="/terms" className="hover:text-ink transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:text-ink transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
