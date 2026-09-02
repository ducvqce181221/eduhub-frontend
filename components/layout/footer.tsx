import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-hairline bg-canvas-soft mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-muted">
        <div className="flex items-center gap-2">
          <span className="size-5 rounded-sm bg-notion-blue text-white flex items-center justify-center text-xs font-bold">
            E
          </span>
          <span className="font-semibold text-ink">EduHub</span>
          <span>© {new Date().getFullYear()} Notion-inspired LMS. All rights reserved.</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/courses" className="hover:text-ink transition-colors">
            Courses
          </Link>
          <Link href="/privacy" className="hover:text-ink transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-ink transition-colors">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
