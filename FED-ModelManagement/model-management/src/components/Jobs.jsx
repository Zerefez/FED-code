import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobsAPI, modelsAPI } from '../services/api';
import { handleApiError } from '../utils/errorHandling';
import Button from './common/Button';
import { Card, CardContent, CardHeader, CardTitle } from './common/Card';
import ErrorMessage from './common/ErrorMessage';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedModel, setSelectedModel] = useState('');
  const { isManager } = useAuth();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError('');
        const jobsData = await jobsAPI.getAllJobs();
        setJobs(jobsData);
        
        if (isManager) {
          const modelsData = await modelsAPI.getAllModels();
          setModels(modelsData);
        }
      } catch (err) {
        handleApiError(err, setError, setLoading, 'Failed to fetch jobs data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [isManager]);

  const addModelToJob = async (jobId) => {
    if (!selectedModel) return;
    
    try {
      setError('');
      await jobsAPI.addModelToJob(jobId, selectedModel);
      // Refresh job list
      const updatedJobs = await jobsAPI.getAllJobs();
      setJobs(updatedJobs);
      setSelectedModel('');
      setSelectedJob(null);
    } catch (err) {
      handleApiError(err, setError, null, `Failed to add model to job ${jobId}`);
    }
  };

  const removeModelFromJob = async (jobId, modelId) => {
    try {
      setError('');
      await jobsAPI.removeModelFromJob(jobId, modelId);
      // Refresh job list
      const updatedJobs = await jobsAPI.getAllJobs();
      setJobs(updatedJobs);
    } catch (err) {
      handleApiError(err, setError, null, `Failed to remove model from job ${jobId}`);
    }
  };

  const deleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    
    try {
      setError('');
      await jobsAPI.deleteJob(jobId);
      // Remove the job from the list
      setJobs(jobs.filter(job => job.jobId !== jobId));
    } catch (err) {
      handleApiError(err, setError, null, `Failed to delete job ${jobId}`);
    }
  };

  if (loading) return <div className="text-center py-10 text-foreground">Loading jobs...</div>;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card>
      <ErrorMessage error={error} />
      
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Jobs</CardTitle>
        {isManager && (
          <Button asChild>
            <Link to="/create-job">
              Create New Job
            </Link>
          </Button>
        )}
      </CardHeader>
      
      <CardContent>
        {jobs.length === 0 ? (
          <p className="text-muted-foreground">No jobs found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-secondary/20">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Start Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Days
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Models
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {jobs.map((job, idx) => (
                  <tr key={job.jobId} className={idx % 2 === 0 ? "bg-secondary/10" : ""}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      {job.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(job.startDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {job.days}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {job.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {job.models && job.models.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-1">
                          {job.models.map(model => (
                            <li key={model.modelId} className="flex items-center justify-between text-foreground">
                              {model.firstName} {model.lastName}
                              {isManager && (
                                <Button 
                                  variant="destructive" 
                                  size="xs"
                                  onClick={() => removeModelFromJob(job.jobId, model.modelId)}
                                  className="ml-2 px-2 py-1"
                                >
                                  Remove
                                </Button>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-muted-foreground italic">No models assigned</span>
                      )}
                      
                      {isManager && (
                        <div className="mt-2">
                          {selectedJob === job.jobId ? (
                            <div className="flex items-center mt-2 space-x-2">
                              <select
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                                className="block w-full py-2 px-3 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                              >
                                <option value="">Select a model</option>
                                {models.map(model => (
                                  <option key={model.modelId || model.id} value={model.modelId || model.id} className="bg-background text-foreground">
                                    {model.firstName} {model.lastName}
                                  </option>
                                ))}
                              </select>
                              <Button
                                onClick={() => addModelToJob(job.jobId)}
                                size="sm"
                              >
                                Add
                              </Button>
                              <Button
                                onClick={() => setSelectedJob(null)}
                                variant="outline"
                                size="sm"
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              onClick={() => setSelectedJob(job.jobId)}
                              variant="outline"
                              size="sm"
                            >
                              Add Model
                            </Button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2 flex">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link to={`/jobs/${job.jobId}`}>
                          View Details
                        </Link>
                      </Button>
                      {isManager && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteJob(job.jobId)}
                        >
                          Delete
                        </Button>
                      )}
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