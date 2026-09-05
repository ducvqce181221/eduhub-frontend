import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors select-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-notion-blue/25 bg-notion-blue/10 text-notion-blue",
        secondary: "border-hairline bg-surface text-ink-secondary",
        outline: "border-hairline text-ink-muted bg-transparent",
        student: "border-hairline bg-canvas-soft text-ink-secondary",
        teacher: "border-sticker-purple/40 bg-sticker-purple/20 text-sticker-purple-deep font-semibold",
        admin: "border-sticker-orange/30 bg-sticker-orange/15 text-sticker-orange-deep font-semibold",
        sky: "border-sticker-sky/30 bg-sticker-sky/15 text-notion-blue-active",
        purple: "border-sticker-purple/40 bg-sticker-purple/20 text-sticker-purple-deep",
        pink: "border-sticker-pink/30 bg-sticker-pink/15 text-sticker-pink",
        orange: "border-sticker-orange/30 bg-sticker-orange/15 text-sticker-orange-deep",
        amber: "border-sticker-amber/30 bg-sticker-amber/15 text-sticker-amber-deep font-semibold",
        teal: "border-sticker-teal/30 bg-sticker-teal/15 text-sticker-teal",
        green: "border-sticker-green/30 bg-sticker-green/15 text-sticker-green",
        destructive: "border-sticker-orange/30 bg-sticker-orange/10 text-sticker-orange-deep",
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
