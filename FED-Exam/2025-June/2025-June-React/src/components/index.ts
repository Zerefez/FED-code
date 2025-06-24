// Main components barrel export file
// This file provides a clean, organized interface for importing components
// It groups related components by functional area for better developer experience

// Layout components - handles page structure, navigation, and visual layout
// Exports Layout component and navigation-related utilities
export * from './layout';

// Router components - manages client-side routing and navigation
// Exports AppRouter and routing configuration
export * from './router';

// Theme components - provides theming capabilities and dark/light mode support
// Exports ThemeProvider for wrapping the app with theme context
export { ThemeProvider } from './theme-provider';

