import * as React from "react"

import { cn } from "@/lib/utils"

// Generic Input component that extends HTML input with consistent styling
// Accepts all standard HTML input props while providing design system styling
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}                                               // Pass through the input type (text, email, etc.)
      data-slot="input"                                         // Data attribute for styling hooks and testing
      className={cn(
        // Base input styling with design system tokens
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        
        // Focus state styling with ring and border color changes
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        
        // Error state styling for accessibility and visual feedback
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        
        // Allow custom classes to override defaults
        className
      )}
      {...props}                                                // Forward all other props to input element
    />
  )
}

// Export the Input component for use throughout the application
export { Input }

