import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-md border border-hairline bg-surface px-3 py-1.5 text-sm text-ink transition-colors outline-none placeholder:text-ink-faint focus-visible:border-notion-blue focus-visible:ring-1 focus-visible:ring-notion-blue disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-canvas-soft disabled:opacity-50 aria-invalid:border-sticker-orange aria-invalid:ring-1 aria-invalid:ring-sticker-orange",
        className
      )}
      {...props}
    />
  )
}

export { Input }
