import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';
import { Card, CardContent, CardHeader, CardTitle } from './common/Card';

export default function Dashboard() {
  const { currentUser, isManager } = useAuth();

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
        ) : (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Model Actions:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentUser?.modelId && (
                <>
                  <DashboardCard 
                    to={`/models/${currentUser.modelId}/jobs`}
                    title="My Jobs"
                    description="View all jobs you are assigned to"
                  />
                  
                  <DashboardCard 
                    to={`/models/${currentUser.modelId}/expenses`}
                    title="My Expenses"
                    description="View and manage your job expenses"
                  />
                </>
              )}
              
              <DashboardCard 
                to="/jobs"
                title="View Jobs"
                description="View all jobs you are assigned to and add expenses"
              />
            </div>
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