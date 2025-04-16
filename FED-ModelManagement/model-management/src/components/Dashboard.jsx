import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { managersAPI } from '../services/api';
import { cn } from '../utils/cn';
import { Card, CardContent, CardHeader, CardTitle } from './common/Card';

export default function Dashboard() {
  const { currentUser, isManager, isModel, getModelId } = useAuth();
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  // Get correct model identifier for navigation
  const modelIdentifier = getModelId() || (currentUser?.email && isModel ? currentUser.email : null);
  
  // Ensure user is a model but not a manager for model-specific content
  const isModelOnly = isModel && !isManager;
  
  // Debug the model state right away
  console.log('Dashboard: Initial state', { 
    modelIdentifier, 
    isModel, 
    isManager,
    isModelOnly,
    currentUser
  });
  
  // Fetch user name for managers only
  useEffect(() => {
    const fetchManagerData = async () => {
      if (!currentUser || !isManager) return;
      
      setLoading(true);
      try {
        // Fetch manager data using the managers API
        const managers = await managersAPI.getAllManagers();
        // Find the manager that matches the current user's email
        const userData = managers?.find(m => m.email === currentUser.email);
        console.log('Manager data found:', userData);
        
        if (userData) {
          const firstName = userData.firstName || '';
          const lastName = userData.lastName || '';
          const name = `${firstName} ${lastName}`.trim();
          
          console.log('Name components for manager:', { firstName, lastName, fullName: name });
          
          if (name) {
            setFullName(name);
            console.log('Dashboard: Manager name set to:', name);
          }
        }
      } catch (error) {
        console.error('Dashboard: Error fetching manager data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchManagerData();
  }, [currentUser, isManager]);
  
  // Debug information
  console.log('Dashboard: Current User Data:', currentUser);
  console.log('Dashboard: Model ID:', modelIdentifier);
  console.log('Dashboard: Full Name:', fullName);

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
        {isManager && (
          <p className="text-muted-foreground">
            Name: <span className="font-semibold text-foreground">{loading ? 'Loading...' : (fullName || '[Name not available]')}</span>
          </p>
        )}
        
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
              
              <DashboardCard 
                to="/expenses"
                title="All Expenses"
                description="View and manage all model expenses across jobs"
              />
            </div>
          </div>
        ) : isModelOnly ? (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Model Actions:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* For models - Jobs link */}
              <DashboardCard 
                to="/jobs"
                title="Jobs"
                description="View and manage your assigned jobs"
              />
              
              {/* Expenses for models */}
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