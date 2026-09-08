"use client";

import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme/theme-context";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle theme"
        className={`w-8 h-8 rounded-full border border-hairline text-ink-muted hover:text-ink hover:bg-canvas-soft ${className || ""}`}
      >
        <span className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
      className={`w-8 h-8 rounded-full border border-hairline text-ink-muted hover:text-ink hover:bg-canvas-soft cursor-pointer transition-colors ${className || ""}`}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="w-4 h-4 text-sticker-amber" />
      ) : (
        <Moon className="w-4 h-4 text-ink-secondary" />
      )}
    </Button>
  );
}
