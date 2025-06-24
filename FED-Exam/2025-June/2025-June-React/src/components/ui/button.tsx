import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

// Create variant system using class-variance-authority (cva)
// This provides type-safe, composable variants for the button component
const buttonVariants = cva(
  // Base classes that apply to all button variants
  // These provide the fundamental button styling and behavior
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    // Define different visual variants for the button
    variants: {
      variant: {
        // Default primary button style with brand colors
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        // Destructive actions like delete, with red coloring
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        // Outlined button for secondary actions
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        // Secondary button with muted colors
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        // Ghost button with minimal styling, used for subtle actions
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        // Link-style button that looks like a hyperlink
        link: "text-primary underline-offset-4 hover:underline",
      },
      // Define different size variants for the button
      size: {
        // Default size suitable for most use cases
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        // Smaller size for compact layouts
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        // Larger size for prominent actions
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        // Square icon-only button
        icon: "size-9",
      },
    },
    // Set default variants when none are specified
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Button component with polymorphic behavior and variant support
function Button({
  className,
  variant,
  size,
  asChild = false,  // When true, renders as the child element instead of button
  ...props         // Spread remaining props to the underlying element
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  // Choose component type based on asChild prop
  // Slot from Radix UI allows rendering as a different element while keeping button behavior
  // This is useful for cases like <Button asChild><Link to="/path">Click me</Link></Button>
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"  // Data attribute for styling hooks and testing
      // Combine variant classes with any additional className passed in
      // cn utility merges classes and handles Tailwind conflicts
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}  // Forward all other props to the underlying element
    />
  )
}

// Export both the component and variants for external use
// buttonVariants can be used in other components that need button-like styling
export { Button, buttonVariants }

