import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';
import { Card, CardContent, CardHeader, CardTitle } from './common/Card';

export default function Dashboard() {
  const { currentUser, isManager, isModel, getModelId } = useAuth();

  // Get correct model identifier for navigation
  const modelIdentifier = getModelId();
  console.log('Dashboard: Model identifier for navigation:', modelIdentifier);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome to Model Management</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          You are logged in as: <span className="font-semibold text-foreground">{currentUser?.email}</span>
        </p>
        <p className="text-muted-foreground">
          Role: <span className="font-semibold text-foreground">{isManager ? 'Manager' : 'Model'}</span>
        </p>
        
        {isManager ? (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Manager Actions:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DashboardCard 
                to="/models"
                title="Manage Models"
                description="View all models, create new models, assign models to jobs"
              />
              
              <DashboardCard 
                to="/create-model"
                title="Create New Model"
                description="Add a new model to the system"
              />
              
              <DashboardCard 
                to="/managers"
                title="Manage Managers"
                description="View all managers and create new managers"
              />
              
              <DashboardCard 
                to="/create-manager"
                title="Create New Manager"
                description="Add a new manager to the system"
              />
              
              <DashboardCard 
                to="/jobs"
                title="Manage Jobs"
                description="View all jobs, assign models to jobs, and manage job details"
              />
              
              <DashboardCard 
                to="/create-job"
                title="Create New Job"
                description="Create a new job in the system"
              />
            </div>
          </div>
        ) : isModel ? (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Model Actions:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* For models - use the ID from getModelId function */}
              <DashboardCard 
                to="/jobs"
                title="My Jobs"
                description="View all jobs you are assigned to"
              />
              
              <DashboardCard 
                to={`/models/${modelIdentifier}/expenses`}
                title="My Expenses"
                description="View and manage your job expenses"
              />
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <p className="text-muted-foreground">
              Your account doesn't have specific permissions assigned. Please contact an administrator.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DashboardCard({ to, title, description }) {
  return (
    <Link
      to={to}
      className={cn(
        "p-4 rounded-lg border border-border transition-colors",
        "bg-card hover:bg-secondary/20"
      )}
    >
      <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Link>
  );
}