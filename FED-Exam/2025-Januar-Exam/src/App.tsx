import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/hooks/use-auth'
import { router } from '@/routes/route-config'
import React from 'react'
import { RouterProvider } from 'react-router-dom'

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <RouterProvider router={router} />
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App 