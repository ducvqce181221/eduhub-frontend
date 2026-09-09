"use client";

import React from "react";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/lib/i18n/language-context";
import { VietnamFlag, UsFlag } from "@/components/common/flag-icons";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export interface LanguageOption {
  code: Locale;
  name: string;
  shortLabel: string;
  englishName: string;
  Flag: React.ComponentType<{ className?: string }>;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: "vi",
    name: "Tiếng Việt",
    shortLabel: "VI",
    englishName: "Vietnamese",
    Flag: VietnamFlag,
  },
  {
    code: "en",
    name: "English",
    shortLabel: "EN",
    englishName: "English (US)",
    Flag: UsFlag,
  },
];

interface LanguageSelectorProps {
  className?: string;
  align?: "start" | "center" | "end";
}

export function LanguageSelector({
  className,
  align = "end",
}: LanguageSelectorProps) {
  const { language, switchLanguage, isPending, t } = useLanguage();

  const currentOption =
    SUPPORTED_LANGUAGES.find((lang) => lang.code === language) ||
    SUPPORTED_LANGUAGES[0];

  const CurrentFlag = currentOption.Flag;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={isPending}
        aria-label={`Current language: ${currentOption.name}. Select to change language`}
        className={cn(
          "group flex h-8 items-center gap-1 rounded-full border border-hairline bg-surface px-2 py-1 text-xs font-medium text-ink shadow-2xs transition-colors hover:bg-canvas-soft hover:text-ink focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-notion-blue cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed",
          className,
        )}
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-notion-blue shrink-0" />
        ) : (
          <CurrentFlag className="h-3.5 w-4.5 shrink-0" />
        )}

        <ChevronDown className="h-3 w-3 text-ink-muted transition-transform duration-200 group-data-[state=open]:rotate-180 shrink-0" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={align}
        sideOffset={6}
        className="w-48 rounded-lg border border-hairline bg-surface p-1.5 shadow-notion-dropdown text-ink z-50 animate-in fade-in-0 zoom-in-95"
      >
        <DropdownMenuLabel className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink-faint select-none">
          {t?.common?.selectLanguage || "Select language"}
        </DropdownMenuLabel>

        <div className="space-y-0.5 mt-0.5">
          {SUPPORTED_LANGUAGES.map((item) => {
            const isActive = item.code === language;
            const FlagComponent = item.Flag;

            return (
              <DropdownMenuItem
                key={item.code}
                onClick={() => switchLanguage(item.code)}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs transition-colors cursor-pointer select-none",
                  isActive
                    ? "bg-canvas-soft/90 font-semibold text-ink shadow-2xs"
                    : "text-ink-secondary hover:bg-canvas-soft hover:text-ink",
                )}
              >
                <FlagComponent className="h-3.5 w-4.5 shrink-0" />

                <div className="flex flex-col min-w-0 flex-1 text-left">
                  <span className="text-xs font-medium text-ink leading-none">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-ink-muted leading-tight mt-0.5">
                    {item.englishName}
                  </span>
                </div>

                {isActive && (
                  <Check className="h-3.5 w-3.5 text-notion-blue shrink-0 ml-1.5" />
                )}
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
