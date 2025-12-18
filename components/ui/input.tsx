import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground/70 selection:bg-primary/20 selection:text-foreground border-border h-9 w-full min-w-0 rounded border bg-background px-3 py-1.5 text-sm transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'hover:border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20',
        'aria-invalid:border-destructive aria-invalid:focus:ring-destructive/20',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
