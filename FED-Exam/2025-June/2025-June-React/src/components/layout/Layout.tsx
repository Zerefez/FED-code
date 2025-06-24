import { Navbar, NavbarActions, NavbarBrand, NavbarItem, NavbarMenu } from '@/components/ui/navbar-menu';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { navigationItems } from '@/router';
import { useLocation, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActivePage = (path: string, isExact?: boolean) => {
    if (isExact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar>
        <NavbarBrand>
          <h1 className="text-xl font-bold">Eksamen Admin</h1>
        </NavbarBrand>
        
        <NavbarMenu>
          {navigationItems.map((item) => (
            <NavbarItem 
              key={item.path}
              active={isActivePage(item.path, item.isExact)} 
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </NavbarItem>
          ))}
        </NavbarMenu>
        
        <NavbarActions>
          <ThemeToggle />
        </NavbarActions>
      </Navbar>
      
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
} 