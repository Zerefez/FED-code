import { AppRouter } from '@/components/router'
import { ThemeProvider } from '@/components/theme-provider'
import React from 'react'

// Main application component that serves as the root of the React component tree
const App: React.FC = () => {
  return (
    // ThemeProvider wraps the entire app to provide theme context (dark/light/system)
    // defaultTheme="system" means it will automatically detect user's OS theme preference
    // storageKey defines where theme preference is stored in localStorage for persistence
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      {/* AppRouter handles all client-side routing using React Router */}
      {/* This creates a Single Page Application where navigation doesn't require full page reloads */}
      <AppRouter />
    </ThemeProvider>
  )
}

// Export as default to make it the main entry point for the application
export default App 