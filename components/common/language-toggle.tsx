"use client";

import React from "react";
import { LanguageSelector } from "./language-selector";

/**
 * Re-export LanguageSelector as LanguageToggle for backward compatibility
 */
export function LanguageToggle({ className }: { className?: string }) {
  return <LanguageSelector className={className} />;
}

export { LanguageSelector };
