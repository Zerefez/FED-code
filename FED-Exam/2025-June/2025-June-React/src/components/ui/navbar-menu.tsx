import { cn } from "@/lib/utils";
import React from "react";

// Props interface for the main Navbar container component
interface NavbarProps {
  className?: string;         // Optional custom CSS classes
  children: React.ReactNode;  // Child components to render inside navbar
}

// Main Navbar container component that provides the top-level navigation structure
// Creates a horizontal layout with backdrop blur and consistent styling
export const Navbar = ({ className, children }: NavbarProps) => {
  return (
    <nav
      className={cn(
        // Base navbar styling with backdrop blur, border, and responsive layout
        "flex items-center justify-between w-full px-6 py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border",
        className // Allow custom classes to override defaults
      )}
    >
      {children}
    </nav>
  );
};

// Props interface for the navbar brand/logo area
interface NavbarBrandProps {
  children: React.ReactNode;  // Brand content (logo, title, etc.)
  className?: string;         // Optional custom CSS classes
}

// NavbarBrand component for the left side of the navbar
// Typically contains logo, application name, or brand elements
export const NavbarBrand = ({ children, className }: NavbarBrandProps) => {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {children}
    </div>
  );
};

// Props interface for the navigation menu container
interface NavbarMenuProps {
  children: React.ReactNode;  // Navigation items to display
  className?: string;         // Optional custom CSS classes
}

// NavbarMenu component for the center area containing navigation links
// Provides horizontal layout for navigation items with consistent spacing
export const NavbarMenu = ({ children, className }: NavbarMenuProps) => {
  return (
    <div className={cn("flex items-center space-x-6", className)}>
      {children}
    </div>
  );
};

// Props interface for individual navigation items
interface NavbarItemProps {
  children: React.ReactNode;  // Item content (text, icons, etc.)
  onClick?: () => void;       // Optional click handler for navigation
  active?: boolean;           // Whether this item represents the current page
  className?: string;         // Optional custom CSS classes
}

// NavbarItem component for individual navigation links/buttons
// Handles active state styling and hover effects for navigation items
export const NavbarItem = ({ children, onClick, active = false, className }: NavbarItemProps) => {
  return (
    <button
      onClick={onClick}                                           // Handle navigation when clicked
      className={cn(
        // Base styling for navigation items with hover effects
        "text-sm font-medium transition-colors hover:text-primary",
        // Conditional styling based on active state
        active 
          ? "text-primary"                                        // Active item gets primary color
          : "text-muted-foreground",                              // Inactive items get muted color
        className                                                 // Allow custom classes
      )}
    >
      {children}
    </button>
  );
};

// Props interface for the navbar actions area
interface NavbarActionsProps {
  children: React.ReactNode;  // Action elements (buttons, toggles, etc.)
  className?: string;         // Optional custom CSS classes
}

// NavbarActions component for the right side of the navbar
// Contains action items like theme toggles, user menus, or utility buttons
export const NavbarActions = ({ children, className }: NavbarActionsProps) => {
  return (
    <div className={cn("flex items-center space-x-4", className)}>
      {children}
    </div>
  );
};
