import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-black dark:bg-black text-white shadow-black/10 dark:shadow-black/25 hover:bg-black/90 dark:hover:bg-black/90 hover:shadow-black/20 dark:hover:shadow-black/30 active:bg-black/80 dark:active:bg-black/50 active:shadow-black/10 dark:active:shadow-black/20",
        destructive:
          "bg-red-500 dark:bg-red-600 text-white shadow-lg shadow-red-500/10 dark:shadow-red-500/20 hover:bg-red-600 dark:hover:bg-red-700 hover:shadow-red-500/20 dark:hover:shadow-red-500/30 active:bg-red-700 dark:active:bg-red-800 active:shadow-red-500/10 dark:active:shadow-red-500/20",
        outline:
          "border dark:border-white/10 bg-white dark:bg-white/5 dark:hover:bg-white/5 text-gray-900 dark:text-gray-100 hover:bg-gray-100 transition-all duration-300 dark:hover:to-black shadow-sm active:bg-gray-200 dark:active:opacity-90",
        secondary:
          "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-gray-200/20 dark:shadow-gray-900/20 hover:bg-gray-200 dark:hover:bg-gray-700 hover:shadow-gray-300/30 dark:hover:shadow-gray-800/30 active:bg-gray-300 dark:active:bg-gray-600",
        ghost: "text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700",
        link: "text-black dark:text-white underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-md px-8",
        icon: "h-10 w-10",
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
