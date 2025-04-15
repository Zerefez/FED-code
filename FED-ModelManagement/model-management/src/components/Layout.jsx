import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';

export default function Layout() {
  const { currentUser, logout, isManager } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-foreground font-bold text-xl">ModelManagement</span>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <NavLink to="/dashboard">Dashboard</NavLink>
                  <NavLink to="/jobs">Jobs</NavLink>
                  
                  {isManager && (
                    <>
                      <NavLink to="/models">Models</NavLink>
                      <NavLink to="/managers">Managers</NavLink>
                      <NavLink to="/create-job">Create Job</NavLink>
                      <NavLink to="/create-model">Create Model</NavLink>
                      <NavLink to="/create-manager">Create Manager</NavLink>
                    </>
                  )}
                  
                  {!isManager && currentUser?.modelId && (
                    <NavLink to={`/models/${currentUser.modelId}/jobs`}>My Jobs</NavLink>
                  )}
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                <span className="text-foreground mr-4">{currentUser?.email}</span>
                <button
                  onClick={logout}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium",
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}

function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      className={cn(
        "px-3 py-2 rounded-md text-sm font-medium",
        "text-foreground hover:bg-secondary hover:text-secondary-foreground"
      )}
    >
      {children}
    </Link>
  );
}