import { Calendar, Edit, FileText, LucideIcon } from 'lucide-react'
import React, { useState } from 'react'
import { HoveredLink } from './ui/navbar-menu'

  // Interfaces
interface NavigationLink {
  id: string
  label: string
  href: string
  icon?: LucideIcon
}

interface NavigationItem {
  id: string
  title: string
  href: string
  links: NavigationLink[]
}

// Navigation data
const navigationData: NavigationItem[] = [
  {
    id: 'home',
    title: 'Home',
    href: '/',
    links: [
      { id: 'about', label: 'Om os', href: '/about' },
      { id: 'contact', label: 'Kontakt', href: '/contact' }
    ]
  },
  {
    id: 'book-service',
    title: 'Book ny aftale',
    href: '/book',
    links: [
      { id: 'maintenance', label: 'Planlæg service', href: '/book/maintenance', icon: Calendar },
      { id: 'repair', label: 'Reparér bil', href: '/book/repair' },
      { id: 'inspection', label: 'Kontrol af bil', href: '/book/inspection' },
      { id: 'emergency', label: 'Ulykke', href: '/book/emergency' }
    ]
  },
  {
    id: 'edit-agreement',
    title: 'Rediger aftale',
    href: '/agreement/edit',
    links: [
      { id: 'modify', label: 'Rediger aftale', href: '/agreement/edit', icon: Edit },
      { id: 'terms', label: 'Rediger betingelser', href: '/agreement/terms' },
      { id: 'billing', label: 'Rediger faktura', href: '/agreement/billing' },
      { id: 'cancel', label: 'Aftale afslutning', href: '/agreement/cancel' }
    ]
  },
  {
    id: 'view-agreement',
    title: 'Se aftale',
    href: '/agreement/view',
    links: [
      { id: 'current', label: 'Aktuel aftale', href: '/agreement/view', icon: FileText },
      { id: 'history', label: 'Aftale historik', href: '/agreement/history' },
      { id: 'download', label: 'Download PDF', href: '/agreement/download' },
      { id: 'status', label: 'Aftale status', href: '/agreement/status' }
    ]
  }
]

// Main Navigation Component
export const Navigation: React.FC = () => {
  const [active, setActive] = useState<string | null>(null)

  return (
    <div className="flex justify-center pt-4">
      <nav
        onMouseLeave={() => setActive(null)}
        className="relative rounded-full border border-border bg-card shadow-sm flex justify-center space-x-4 px-8 py-6"
      >
        {navigationData.map((navItem) => (
          <div key={navItem.id} onMouseEnter={() => setActive(navItem.title)} className="relative">
            <div
              onClick={() => window.location.href = navItem.href}
              className="cursor-pointer text-foreground hover:text-primary transition-colors duration-300 hover:underline"
            >
              {navItem.title}
            </div>
            {active === navItem.title && (
              <div className="absolute top-[calc(100%_+_1.2rem)] left-1/2 transform -translate-x-1/2 pt-4">
                <div className="bg-popover border border-border rounded-2xl overflow-hidden shadow-xl">
                  <div className="w-max h-full p-4 flex flex-col space-y-4 text-sm">
                    {navItem.links.map((link) => {
                      const IconComponent = link.icon
                      return (  
                        <HoveredLink key={link.id} href={link.href}>
                          <div className="flex items-center space-x-2 text-secondary-foreground hover:text-muted-foreground transition-colors duration-300">
                            {IconComponent && <IconComponent className="h-4 w-4" />}
                            <span>{link.label}</span>
                          </div>
                        </HoveredLink>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  )
}

// Export data for external use if needed
export { navigationData }
