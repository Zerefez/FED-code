// Import React for component definition
import * as React from "react"
// Import Radix UI Label primitive for accessibility features
import * as LabelPrimitive from "@radix-ui/react-label"

// Import utility function for class name merging
import { cn } from "@/lib/utils"

// Label component built on Radix UI Label primitive
// Provides accessible form labeling with consistent styling
function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"                                           // Data attribute for styling hooks and testing
      className={cn(
        // Base label styling with proper typography and accessibility states
        // Includes disabled states that work with form group patterns
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className                                                 // Allow custom classes to override defaults
      )}
      {...props}                                                  // Forward all other props to Radix Label
    />
  )
}

// Export the Label component for use in forms throughout the application
export { Label }

