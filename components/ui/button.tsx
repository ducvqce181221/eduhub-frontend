import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-notion-blue/50 active:scale-98 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-notion-blue text-white hover:bg-notion-blue-active shadow-xs",
        pill: "rounded-full bg-notion-blue text-white hover:bg-notion-blue-active shadow-xs px-6",
        secondary:
          "bg-surface text-ink-secondary border border-hairline hover:bg-canvas-soft hover:text-ink shadow-notion-soft",
        utility:
          "bg-surface text-ink border border-hairline rounded-md hover:bg-canvas-soft text-xs font-medium px-3 py-1.5",
        outline:
          "border border-hairline bg-surface text-ink-secondary hover:bg-canvas-soft hover:text-ink",
        ghost:
          "text-ink-secondary hover:bg-black/5 hover:text-ink",
        destructive:
          "bg-sticker-orange text-white hover:bg-sticker-orange-deep shadow-xs",
        link: "text-notion-blue underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-9 gap-2 px-3.5 text-sm",
        xs: "h-6 gap-1 rounded-md px-2 text-xs",
        sm: "h-8 gap-1.5 rounded-md px-3 text-xs",
        lg: "h-11 gap-2 rounded-xl px-5 text-base",
        icon: "size-9 rounded-md",
        "icon-sm": "size-7 rounded-md",
        "icon-lg": "size-10 rounded-lg",
        "icon-circular": "size-9 rounded-full bg-black/5 hover:bg-black/10 text-ink-secondary",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
