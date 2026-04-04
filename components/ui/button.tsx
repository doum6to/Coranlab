import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold ring-offset-background transition-[colors,transform,filter] duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 uppercase tracking-wide active:scale-[0.97] active:brightness-95",
  {
    variants: {
      variant: {
        locked: "bg-neutral-200 text-primary-foreground hover:bg-neutral-200/90 border-neutral-400 border-b-4 active:border-b-0",
        default: "bg-white text-brilliant-text border-brilliant-border border border-b-4 active:border-b-2 hover:bg-brilliant-surface",
        primary: "bg-brilliant-green text-white hover:bg-brilliant-green/90 border-green-600 border-b-4 active:border-b-0",
        primaryOutline: "bg-white text-brilliant-green hover:bg-brilliant-surface border border-brilliant-border",
        secondary: "bg-brilliant-green text-white hover:bg-brilliant-green/90 border-green-600 border-b-4 active:border-b-0",
        secondaryOutline: "bg-white text-brilliant-green hover:bg-brilliant-surface",
        danger: "bg-rose-500 text-white hover:bg-rose-500/90 border-rose-600 border-b-4 active:border-b-0",
        dangerOutline: "bg-white text-rose-500 hover:bg-brilliant-surface",
        super: "bg-brilliant-purple text-white hover:bg-brilliant-purple/90 border-brilliant-purple/80 border-b-4 active:border-b-0",
        superOutline: "bg-white text-brilliant-purple hover:bg-brilliant-surface",
        ghost: "bg-transparent text-brilliant-muted border-transparent border-0 hover:bg-brilliant-surface",
        sidebar: "bg-transparent text-brilliant-muted border-2 border-transparent hover:bg-brilliant-surface transition-none",
        sidebarOutline: "bg-brilliant-green/10 text-brilliant-green border-brilliant-green/30 border-2 hover:bg-brilliant-green/15 transition-none"
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-14 px-8",
        icon: "h-10 w-10",
        rounded: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
