"use client"


import * as React from "react"
import { DayPicker } from "react-day-picker"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        day_selected: "!bg-primary !text-primary-foreground",
        nav_button_previous: "!bg-transparent",
        nav_button_next: "!bg-transparent",
      }}
      footer={null}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
