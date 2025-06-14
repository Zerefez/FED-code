import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex items-center justify-end fixed top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="w-full h-screen flex items-center justify-center">
        <Outlet />
      </div>
    </div>
  );
} 