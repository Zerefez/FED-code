import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';

export default function Layout() {
  const { currentUser, logout, isManager, isModel, getModelId } = useAuth();
  const modelId = isModel ? getModelId() : null;
  
  // Ensure user is a model but not a manager for model-specific routes
  const isModelOnly = isModel && !isManager;
  
  return (
    <div className="min-h-screen bg-background py-4">
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-foreground font-bold text-xl">ModelManagement</span>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4 ">
                  <NavLink to="/dashboard">Dashboard</NavLink>
                  <NavLink to="/jobs">Jobs</NavLink>
                  
                  {isManager && (
                    <>
                      <NavLink to="/models">Models</NavLink>
                      <NavLink to="/managers">Managers</NavLink>
                      <NavLink to="/expenses">All Expenses</NavLink>
                      <NavLink to="/create-job">Create Job</NavLink>
                      <NavLink to="/create-model">Create Model</NavLink>
                      <NavLink to="/create-manager">Create Manager</NavLink>
                    </>
                  )}
                  
                  {isModelOnly && modelId && (
                    <>
                      <NavLink to={`/models/${modelId}/expenses`}>My Expenses</NavLink>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center">
              {currentUser && (
                <div className="flex items-center space-x-4 mx-4">
                  <span className="text-sm text-muted-foreground">
                    {isManager ? 'Manager' : 'Model'}: {currentUser.email}
                  </span>
                  <button 
                    onClick={logout}
                    className="text-sm text-primary hover:text-primary/80"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}

function NavLink({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);
  
  return (
    <Link
      to={to}
      className={cn(
        "px-3 py-2 rounded-md text-sm font-medium",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-foreground hover:bg-secondary"
      )}
    >
      {children}
    </Link>
  );
}