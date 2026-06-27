"use client"

import * as ProgressPrimitive from "@radix-ui/react-progress"

import * as React from "react"

import { cn } from "@/lib/utils"

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
  value?: number
}) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-base border-2 border-oklch(0.922 0 0) bg-secondary-background dark:border-oklch(1 0 0 / 10%)",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="h-full w-full flex-1 border-r-2 border-oklch(0.922 0 0) bg-main transition-all dark:border-oklch(1 0 0 / 10%)"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
