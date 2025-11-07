import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Custom variants for appointment statuses
        pending: "border-transparent bg-yellow-100 text-yellow-700",
        approved: "border-transparent bg-green-100 text-green-700",
        assigned: "border-transparent bg-blue-100 text-blue-700",
        "checked-in": "border-transparent bg-indigo-100 text-indigo-700",
        "in-service": "border-transparent bg-purple-100 text-purple-700",
        completed: "border-transparent bg-lime-100 text-lime-700",
        "no-show": "border-transparent bg-red-100 text-red-700",
        cancelled: "border-transparent bg-pink-100 text-pink-700",
        rejected: "border-transparent bg-red-100 text-red-700",
        rescheduled: "border-transparent bg-orange-100 text-orange-700",
        locked: "border-transparent bg-gray-100 text-gray-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
