import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-[#4169e1] dark:bg-[#4169e1] text-white shadow-lg shadow-[#4169e1]/10 dark:shadow-[#4169e1]/25 hover:bg-[#3154c4] dark:hover:bg-[#3154c4] hover:shadow-[#4169e1]/20 dark:hover:shadow-[#4169e1]/30 active:bg-[#2745aa] dark:active:bg-[#2745aa] active:shadow-[#4169e1]/10 dark:active:shadow-[#4169e1]/20 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700 before:ease-out",
        destructive:
          "bg-red-500 dark:bg-red-600 text-white shadow-lg shadow-red-500/10 dark:shadow-red-500/20 hover:bg-red-600 dark:hover:bg-red-700 hover:shadow-red-500/20 dark:hover:shadow-red-500/30 active:bg-red-700 dark:active:bg-red-800 active:shadow-red-500/10 dark:active:shadow-red-500/20 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700 before:ease-out",
        outline:
          "border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 active:bg-gray-200 dark:active:bg-gray-700 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-black/5 dark:before:via-white/5 before:to-transparent",
        secondary:
          "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-md shadow-gray-200/20 dark:shadow-gray-900/20 hover:bg-gray-200 dark:hover:bg-gray-700 hover:shadow-gray-300/30 dark:hover:shadow-gray-800/30 active:bg-gray-300 dark:active:bg-gray-600 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-black/5 dark:before:via-white/5 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700 before:ease-out",
        ghost: "text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700",
        link: "text-[#4169e1] dark:text-[#4169e1] underline-offset-4 hover:underline",
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
