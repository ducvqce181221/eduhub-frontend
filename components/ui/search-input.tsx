"use client";

import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "size"> {
  value?: string;
  onSearch: (value: string) => void;
  onClear?: () => void;
  containerClassName?: string;
  size?: "sm" | "default";
}

export function SearchInput({
  value = "",
  onSearch,
  onClear,
  placeholder = "Search...",
  className,
  containerClassName,
  size = "default",
  disabled,
  ...props
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(value);

  // Sync internal state when external controlled value changes
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearch(internalValue.trim());
    }
  };

  const handleClear = () => {
    setInternalValue("");
    onClear?.();
    onSearch("");
  };

  const handleSearchClick = () => {
    onSearch(internalValue.trim());
  };

  const isSmall = size === "sm";

  return (
    <div className={cn("relative flex items-center w-full", containerClassName)}>
      <button
        type="button"
        onClick={handleSearchClick}
        disabled={disabled}
        className={cn(
          "absolute left-3 p-0.5 text-ink-muted hover:text-ink transition-colors cursor-pointer disabled:pointer-events-none disabled:opacity-50",
          isSmall && "left-2.5",
        )}
        aria-label="Submit search"
      >
        <Search className={cn("h-3.5 w-3.5", !isSmall && "h-4 w-4")} />
      </button>

      <input
        type="search"
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "w-full rounded-md border border-hairline bg-surface text-xs text-ink placeholder:text-ink-muted transition-colors",
          "focus:border-notion-blue focus:outline-none focus:ring-1 focus:ring-notion-blue",
          // Hide native browser clear button to prevent duplicate 'x'
          "[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none",
          isSmall ? "h-8 pl-8 pr-8" : "h-9 pl-9 pr-9 text-xs sm:text-sm",
          className,
        )}
        {...props}
      />

      {internalValue && (
        <button
          type="button"
          onClick={handleClear}
          disabled={disabled}
          className={cn(
            "absolute right-2.5 p-1 text-ink-muted hover:text-ink rounded-full transition-colors cursor-pointer",
            isSmall && "right-2 p-0.5",
          )}
          aria-label="Clear search input"
        >
          <X className={cn("h-3.5 w-3.5", isSmall && "h-3 w-3")} />
        </button>
      )}
    </div>
  );
}
