import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { BarChart3, Home, LogOut, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function AppNavigation() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/app/dashboard",
      icon: Home,
    },
    {
      name: "Vaner",
      href: "/app/habits",
      icon: BarChart3,
    },
    {
      name: "Profil",
      href: "/app/profile", 
      icon: User,
    },
  ];

  return (
    <header className="border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and main navigation */}
          <div className="flex items-center gap-8">
            <Link to="/app/dashboard" className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">Habit Tracker</h1>
            </Link>
            
            {/* Navigation links */}
            <nav className="hidden md:flex items-center gap-6">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User info and actions */}
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-sm text-muted-foreground">
              Velkommen, {user?.firstName} {user?.lastName}
            </span>
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Log ud</span>
            </Button>
          </div>
        </div>

        {/* Mobile navigation */}
        <nav className="md:hidden mt-4 flex items-center gap-4 border-t pt-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
} 