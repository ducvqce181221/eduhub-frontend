"use client";

import React from "react";
import Link, { type LinkProps } from "next/link";
import { useLanguage } from "@/lib/i18n/language-context";
import { isValidLocale } from "@/lib/i18n/config";

export interface LocalizedLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>, LinkProps {
  skipLocale?: boolean;
  children: React.ReactNode;
}

export const LocalizedLink = React.forwardRef<HTMLAnchorElement, LocalizedLinkProps>(
  ({ href, skipLocale = false, children, ...props }, ref) => {
    const { language } = useLanguage();

    let localizedHref = href;

    if (!skipLocale && typeof href === "string") {
      if (href.startsWith("/") && !href.startsWith("//")) {
        const firstSegment = href.split("/")[1];
        if (!isValidLocale(firstSegment)) {
          localizedHref = href === "/" ? `/${language}` : `/${language}${href}`;
        }
      }
    } else if (!skipLocale && typeof href === "object" && href.pathname) {
      const pathname = href.pathname;
      if (pathname.startsWith("/") && !pathname.startsWith("//")) {
        const firstSegment = pathname.split("/")[1];
        if (!isValidLocale(firstSegment)) {
          localizedHref = {
            ...href,
            pathname: pathname === "/" ? `/${language}` : `/${language}${pathname}`,
          };
        }
      }
    }

    return (
      <Link ref={ref} href={localizedHref} {...props}>
        {children}
      </Link>
    );
  },
);

LocalizedLink.displayName = "LocalizedLink";
