import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { managersAPI } from '../services/api';
import { cn } from '../utils/cn';
import Button from './common/Button';
import { Card, CardContent, CardHeader, CardTitle } from './common/Card';
import ErrorMessage from './common/ErrorMessage';

export default function Managers() {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedManager, setSelectedManager] = useState(null);
  const { isManager } = useAuth();

  useEffect(() => {
    async function fetchManagers() {
      try {
        setLoading(true);
        const data = await managersAPI.getAllManagers();
        setManagers(data);
        // If we have managers, select the first one by default
        if (data.length > 0) {
          setSelectedManager(data[0]);
        }
      } catch (err) {
        setError('Failed to fetch managers');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchManagers();
  }, []);

  const deleteManager = async (id) => {
    if (!window.confirm('Are you sure you want to delete this manager?')) return;
    
    try {
      await managersAPI.deleteManager(id);
      // Remove from list
      setManagers(managers.filter(manager => manager.managerId !== id));
      
      // If we deleted the selected manager, select another one or set to null
      if (selectedManager && selectedManager.managerId === id) {
        if (managers.length > 1) {
          setSelectedManager(managers.find(m => m.managerId !== id) || null);
        } else {
          setSelectedManager(null);
        }
      }
    } catch (err) {
      setError('Failed to delete manager');
      console.error(err);
    }
  };

  if (loading) return <div className="text-center py-10 text-foreground">Loading managers...</div>;
  
  if (error) return <ErrorMessage error={error} />;

  if (!isManager) {
    return (
      <div className="bg-yellow-100/20 border border-yellow-400 text-yellow-400 px-4 py-3 rounded-md mb-4">
        You do not have permission to view managers.
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Managers</CardTitle>
        <Button asChild>
          <Link to="/create-manager">
            Create New Manager
          </Link>
        </Button>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel - Manager list */}
          <div className="lg:col-span-1">
            {managers.length === 0 ? (
              <p className="text-muted-foreground">No managers found.</p>
            ) : (
              <div className="overflow-y-auto max-h-[70vh] pr-2">
                <h2 className="text-xl font-semibold mb-3 text-foreground">Manager Roster</h2>
                <div className="space-y-2">
                  {managers.map(manager => (
                    <div 
                      key={manager.managerId}
                      onClick={() => setSelectedManager(manager)}
                      className={cn(
                        "p-3 rounded-lg cursor-pointer transition-all",
                        selectedManager && selectedManager.managerId === manager.managerId
                          ? "bg-secondary/50 border-l-4 border-primary"
                          : "bg-secondary/20 hover:bg-secondary/30"
                      )}
                    >
                      <div className="font-medium text-foreground">
                        {manager.firstName} {manager.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">{manager.email}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Right panel - Selected manager details */}
          <div className="lg:col-span-2 bg-secondary/20 rounded-lg p-4">
            {selectedManager ? (
              <div>
                <div className="flex justify-between items-start">
                  <h2 className="text-2xl font-bold mb-4 text-foreground">
                    {selectedManager.firstName} {selectedManager.lastName}
                  </h2>
                  <div className="flex space-x-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteManager(selectedManager.managerId)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div className="bg-card border border-border p-3 rounded-md">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Contact Information</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-muted-foreground text-sm">Name:</span>
                        <p className="text-foreground">{selectedManager.firstName} {selectedManager.lastName}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-sm">Email:</span>
                        <p className="text-foreground">{selectedManager.email}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-sm">Manager ID:</span>
                        <p className="text-foreground">{selectedManager.managerId}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border p-3 rounded-md">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Role & Responsibilities</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-muted-foreground text-sm">Role:</span>
                        <p className="text-foreground">Model Manager</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-sm">Responsibilities:</span>
                        <ul className="list-disc pl-5 mt-1 text-sm text-foreground">
                          <li>Manage models and their portfolio</li>
                          <li>Coordinate jobs and assignments</li>
                          <li>Handle client relationships</li>
                          <li>Manage expenses and payments</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border p-3 rounded-md">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">System Access</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-muted-foreground text-sm">Access Level:</span>
                        <p className="text-foreground">Full administrative access</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-sm">Permissions:</span>
                        <ul className="list-disc pl-5 mt-1 text-sm text-foreground">
                          <li>Create, edit and delete models</li>
                          <li>Manage job assignments</li>
                          <li>Approve expenses</li>
                          <li>Generate reports</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>Select a manager to view details</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 