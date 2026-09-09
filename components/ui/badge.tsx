import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors select-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-notion-blue/25 bg-notion-blue/10 text-notion-blue dark:border-notion-blue/40 dark:bg-notion-blue/15",
        secondary: "border-hairline bg-surface text-ink-secondary dark:border-hairline dark:bg-surface dark:text-ink-secondary",
        outline: "border-hairline text-ink-muted bg-transparent",
        student: "border-hairline bg-canvas-soft text-ink-secondary dark:border-hairline dark:bg-surface/80 dark:text-ink-secondary",
        teacher: "border-sticker-purple/40 bg-sticker-purple/20 text-sticker-purple-deep font-semibold dark:border-purple-500/30 dark:bg-purple-500/15 dark:text-purple-300",
        admin: "border-sticker-orange/30 bg-sticker-orange/15 text-sticker-orange-deep font-semibold dark:border-orange-500/30 dark:bg-orange-500/15 dark:text-orange-300",
        sky: "border-sticker-sky/30 bg-sticker-sky/15 text-notion-blue-active dark:border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-300",
        purple: "border-sticker-purple/40 bg-sticker-purple/20 text-sticker-purple-deep dark:border-purple-500/30 dark:bg-purple-500/15 dark:text-purple-300",
        pink: "border-sticker-pink/30 bg-sticker-pink/15 text-sticker-pink dark:border-pink-500/30 dark:bg-pink-500/15 dark:text-pink-300",
        orange: "border-sticker-orange/30 bg-sticker-orange/15 text-sticker-orange-deep dark:border-orange-500/30 dark:bg-orange-500/15 dark:text-orange-300",
        amber: "border-sticker-amber/30 bg-sticker-amber/15 text-sticker-amber-deep font-semibold dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300",
        teal: "border-sticker-teal/30 bg-sticker-teal/15 text-sticker-teal dark:border-teal-500/30 dark:bg-teal-500/15 dark:text-teal-300",
        green: "border-sticker-green/30 bg-sticker-green/15 text-sticker-green dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300",
        destructive: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
