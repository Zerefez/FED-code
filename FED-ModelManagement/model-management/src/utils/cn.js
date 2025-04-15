import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names using clsx and merges them with tailwind-merge
 * This utility function is similar to shadcn's cn utility
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
} 