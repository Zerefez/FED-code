import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import useJobsList from '../hooks/useJobsList';
import { jobsAPI } from '../services/api';
import Button from './common/Button';
import { Card, CardContent, CardHeader, CardTitle } from './common/Card';
import ErrorMessage from './common/ErrorMessage';
import JobDetail from './job/JobDetail';
import JobInformation from './job/JobInformation';
import JobList from './job/JobList';

export default function Jobs() {
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    customer: '',
    startDate: '',
    days: 1,
    location: '',
    comments: ''
  });
  
  const {
    jobs,
    setJobs,
    models,
    loading,
    error,
    setError,
    selectedJob,
    setSelectedJob,
    selectedModel,
    setSelectedModel,
    addModelToJob,
    removeModelFromJob,
    deleteJob,
    formatDate,
    isManager
  } = useJobsList();

  // When selectedJob changes, update the editFormData
  useEffect(() => {
    if (selectedJob) {
      setEditFormData({
        customer: selectedJob.customer || '',
        startDate: selectedJob.startDate ? new Date(selectedJob.startDate).toISOString().split('T')[0] : '',
        days: selectedJob.days || 1,
        location: selectedJob.location || '',
        comments: selectedJob.comments || ''
      });
    }
  }, [selectedJob]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Format the data as needed for the API
      const jobData = {
        ...editFormData,
        days: parseInt(editFormData.days),
        startDate: new Date(editFormData.startDate).toISOString()
      };
      
      await jobsAPI.updateJob(id, jobData);
      
      // Refresh jobs data to get the updated job
      const jobsData = await jobsAPI.getAllJobs();
      setJobs(jobsData);
      
      // Update the selected job with the refreshed data
      const updatedJob = jobsData.find(job => job.jobId.toString() === id);
      setSelectedJob(updatedJob);
      
      // Exit edit mode
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update job');
      console.error(err);
    }
  };

  if (loading) return <div className="text-center py-10 text-foreground">Loading jobs...</div>;

  return (
    <Card>
      {error && <ErrorMessage error={error} />}
      
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {id && selectedJob 
            ? `Job: ${selectedJob.customer}` 
            : 'Jobs'}
        </CardTitle>
        <div className="flex space-x-2">
          {id && (
            <Button variant="outline" asChild>
              <Link to="/jobs">Back to Jobs</Link>
            </Button>
          )}
          {isManager && id && selectedJob && (
            <>
              {isEditing ? (
                <Button variant="secondary" onClick={() => setIsEditing(false)}>
                  Cancel Edit
                </Button>
              ) : (
                <Button variant="secondary" onClick={() => setIsEditing(true)}>
                  Edit Job
                </Button>
              )}
              <Button variant="destructive" onClick={() => deleteJob(selectedJob.jobId)}>
                Delete Job
              </Button>
            </>
          )}
          {isManager && (
            <Button asChild>
              <Link to="/create-job">
                Create New Job
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {jobs.length === 0 ? (
          <p className="text-muted-foreground">No jobs found.</p>
        ) : id && selectedJob ? (
          <div className="space-y-6">
            {isEditing ? (
              <JobInformation
                job={selectedJob}
                isEditing={isEditing}
                isManager={isManager}
                editFormData={editFormData}
                handleEditChange={handleEditChange}
                handleEditSubmit={handleEditSubmit}
                formatDate={formatDate}
              />
            ) : (
              <JobDetail
                selectedJob={selectedJob}
                formatDate={formatDate}
                isManager={isManager}
                removeModelFromJob={removeModelFromJob}
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                models={models}
                addModelToJob={addModelToJob}
              />
            )}
          </div>
        ) : (
          <JobList
            jobs={jobs}
            selectedJob={selectedJob}
            setSelectedJob={setSelectedJob}
            formatDate={formatDate}
            isManager={isManager}
            deleteJob={deleteJob}
          />
        )}
      </CardContent>
    </Card>
  );
} 