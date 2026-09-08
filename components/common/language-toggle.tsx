"use client";

import React, { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";

export function LanguageToggle({ className }: { className?: string }) {
  const { language, toggleLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={`h-8 px-2.5 rounded-full border border-hairline text-xs font-semibold text-ink-muted hover:text-ink hover:bg-canvas-soft ${className || ""}`}
      >
        <Globe className="w-3.5 h-3.5 mr-1" />
        <span>EN</span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      aria-label={`Switch language. Current: ${language === "vi" ? "Tiếng Việt" : "English"}`}
      className={`h-8 px-2.5 rounded-full border border-hairline text-xs font-semibold text-ink hover:bg-canvas-soft cursor-pointer transition-colors ${className || ""}`}
    >
      <Globe className="w-3.5 h-3.5 mr-1 text-notion-blue" />
      <span className="font-mono uppercase">{language}</span>
    </Button>
  );
}
