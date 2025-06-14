import { LoginForm } from '@/components/login-form'
import { useTheme } from '@/components/theme-provider'
import { ModeToggle } from '@/components/ui/mode-toggle'
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
    <div className="min-h-screen bg-background text-foreground">
        <div className="flex items-center justify-end fixed top-4 right-4 z-10">
          <ModeToggle />
        </div>
        
        {/* Debug info */}
        <div className="fixed top-4 left-4 z-10 p-2 bg-card text-card-foreground rounded border text-xs max-w-xs">
          <div>Current theme: {theme}</div>
          <div>HTML classes: "{htmlClasses}"</div>
          <div className="text-primary">Primary text</div>
          <div className="text-muted-foreground">Muted text</div>
          <div className="bg-secondary text-secondary-foreground p-1 rounded">Secondary bg</div>
        </div>

        <div className="w-full h-screen flex items-center justify-center">
          <LoginForm />
        </div>
    </div>
  )
}

export default App 