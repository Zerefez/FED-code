import { LoginForm } from '@/components/login-form'
import { ThemeProvider, useTheme } from '@/components/theme-provider'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import React, { useEffect, useState } from 'react'


const App: React.FC = () => {
  const { theme } = useTheme()
  const [htmlClasses, setHtmlClasses] = useState('')
  
  useEffect(() => {
    // Check what classes are actually on the HTML element
    const updateHtmlClasses = () => {
      setHtmlClasses(document.documentElement.className)
    }
    
    updateHtmlClasses()
    
    // Watch for changes
    const observer = new MutationObserver(updateHtmlClasses)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    
    return () => observer.disconnect()
  }, [])
  
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
    <div className="min-h-screen bg-background text-foreground">
        <div className="flex items-center justify-end fixed top-4 right-4 z-10">
          <ThemeToggle />
        </div>

        <div className="w-full h-screen flex items-center justify-center">
          <LoginForm />
        </div>
    </div>
    </ThemeProvider>

  )
}

export default App 