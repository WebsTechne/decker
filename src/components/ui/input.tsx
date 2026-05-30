import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "#/lib/utils.ts"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "peer border-input file:text-foreground placeholder:text-muted-foreground focus-visible:border-primary aria-invalid:border-destructive dark:bg-input/30 dark:aria-invalid:border-destructive/50 h-9 w-full min-w-0 rounded-md border bg-transparent px-2.5 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
    // focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3
  )
}

export { Input }
