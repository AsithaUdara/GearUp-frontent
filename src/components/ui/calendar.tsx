"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={cn(
        "p-3",
        classNames,
        "rdp-day_selected:!bg-primary rdp-day_selected:!text-primary-foreground rdp-day_selected:focus:!bg-primary rdp-day_selected:focus:!text-primary-foreground"
      )}
      footer={null}
      components={{
        IconLeft: ({ ...props }) => (<ChevronLeft className="h-4 w-4" />),
        IconRight: ({ ...props }) => (<ChevronRight className="h-4 w-4" />),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
