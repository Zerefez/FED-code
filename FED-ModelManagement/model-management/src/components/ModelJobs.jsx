import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { modelsAPI } from '../services/api';
import { cn } from '../utils/cn';
import Button from './common/Button';
import { Card, CardContent, CardHeader, CardTitle } from './common/Card';
import ErrorMessage from './common/ErrorMessage';

export default function ModelJobs() {
  const { id } = useParams();
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isManager, currentUser } = useAuth();

  useEffect(() => {
    async function fetchModelJobs() {
      try {
        setLoading(true);
        setError('');
        console.log(`ModelJobs component: Fetching jobs for model with ID: ${id}`);
        
        if (!id || id === 'undefined') {
          setError('Invalid model ID');
          console.error('ModelJobs component: No valid ID provided:', id);
          setLoading(false);
          return;
        }
        
        // Parse the ID to a number before passing to API
        const modelId = parseInt(id, 10);
        console.log(`ModelJobs component: Parsed model ID: ${modelId}`);
        
        if (isNaN(modelId)) {
          setError('Invalid model ID format');
          console.error('ModelJobs component: ID is not a valid number:', id);
          setLoading(false);
          return;
        }
        
        const data = await modelsAPI.getModelJobs(modelId);
        
        // Check if we got valid data back
        if (!data) {
          setError('No data returned from server');
          console.error('ModelJobs component: No data returned from API');
          setLoading(false);
          return;
        }
        
        // Validate the model data structure based on API schema
        if (!data.firstName || !data.lastName) {
          console.warn('ModelJobs component: Model data is missing required properties:', data);
        }
        
        // Ensure jobs array exists
        if (!data.jobs || !Array.isArray(data.jobs)) {
          console.warn('ModelJobs component: No valid jobs array in response, creating empty array');
          data.jobs = [];
        } else {
          console.log(`ModelJobs component: Model has ${data.jobs.length} jobs`);
        }
        
        console.log('ModelJobs component: Successfully received model data:', data);
        setModel(data);
      } catch (err) {
        console.error('ModelJobs component: Error fetching model jobs:', err);
        // Provide a more user-friendly error message based on error type
        const errorMessage = err.message || 'Failed to fetch model jobs';
        
        if (errorMessage.includes('404')) {
          setError('Model not found');
        } else if (errorMessage.includes('401')) {
          setError('Unauthorized: You don\'t have permission to view these jobs');
        } else if (errorMessage.includes('400')) {
          setError('Invalid model ID format');
        } else {
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    }
    
    fetchModelJobs();
  }, [id]);

  // Check if the user is allowed to view this model's jobs
  const canViewModelJobs = isManager || (
    currentUser?.modelId && (
      currentUser.modelId === parseInt(id) || 
      currentUser.modelId.toString() === id
    )
  );

  if (loading) return <div className="text-center py-10 text-foreground">Loading model jobs...</div>;
  
  if (error) return <ErrorMessage error={error} />;

  if (!model) return <div className="text-center py-10 text-foreground">Model not found</div>;

  if (!canViewModelJobs) {
    return (
      <div className="bg-yellow-100/20 border border-yellow-400 text-yellow-400 px-4 py-3 rounded-md mb-4">
        You do not have permission to view this model's jobs.
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Jobs for {model.firstName} {model.lastName}</CardTitle>
        <Button variant="outline" asChild>
          <Link to={isManager ? "/models" : "/dashboard"}>
            {isManager ? "Back to Models" : "Back to Dashboard"}
          </Link>
        </Button>
      </CardHeader>
      
      <CardContent>
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-foreground">Model Information</h2>
          <div className="bg-secondary/20 p-4 rounded-md mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="mb-1 text-muted-foreground"><span className="font-medium text-foreground">Name:</span> {model.firstName} {model.lastName}</p>
                <p className="mb-1 text-muted-foreground"><span className="font-medium text-foreground">Email:</span> {model.email}</p>
                {model.phoneNo && (
                  <p className="mb-1 text-muted-foreground"><span className="font-medium text-foreground">Phone:</span> {model.phoneNo}</p>
                )}
                <p className="mb-1 text-muted-foreground">
                  <span className="font-medium text-foreground">Birthday:</span> {formatDate(model.birthDate || model.birthDay)}
                </p>
              </div>
              <div>
                {model.nationality && (
                  <p className="mb-1 text-muted-foreground"><span className="font-medium text-foreground">Nationality:</span> {model.nationality}</p>
                )}
                {model.height && (
                  <p className="mb-1 text-muted-foreground"><span className="font-medium text-foreground">Height:</span> {model.height} m</p>
                )}
                {model.hairColor && (
                  <p className="mb-1 text-muted-foreground"><span className="font-medium text-foreground">Hair Color:</span> {model.hairColor}</p>
                )}
                {model.eyeColor && (
                  <p className="mb-1 text-muted-foreground"><span className="font-medium text-foreground">Eye Color:</span> {model.eyeColor}</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <h2 className="text-xl font-semibold mb-3 text-foreground">Jobs</h2>
        
        {!model.jobs || model.jobs.length === 0 ? (
          <p className="bg-secondary/20 p-4 rounded-md text-muted-foreground">No jobs assigned to this model.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {model.jobs.map((job, idx) => (
                  <tr key={job.jobId || job.id} className={cn("border-b border-border", idx % 2 === 0 ? "bg-card" : "bg-secondary/10")}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      {job.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(job.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {job.days}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {job.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/jobs/${job.jobId || job.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 