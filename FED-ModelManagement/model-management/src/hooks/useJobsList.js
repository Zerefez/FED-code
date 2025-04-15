import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobsAPI, modelsAPI } from '../services/api';

export default function useJobsList() {
  const [jobs, setJobs] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedModel, setSelectedModel] = useState('');
  const { isManager } = useAuth();
  const { id } = useParams();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError('');
        const jobsData = await jobsAPI.getAllJobs();
        setJobs(jobsData);
        
        // If there's an ID in the URL, select that job
        if (id) {
          const jobFromUrl = jobsData.find(job => job.jobId.toString() === id);
          
          if (jobFromUrl) {
            setSelectedJob(jobFromUrl);
          } else {
            console.warn(`Job with ID ${id} not found in the list`);
          }
        }
        
        if (isManager) {
          const modelsData = await modelsAPI.getAllModels();
          setModels(modelsData);
        }
      } catch (err) {
        setError('Failed to fetch jobs data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [isManager, id]);

  const addModelToJob = async (jobId) => {
    if (!selectedModel) return;
    
    try {
      setError('');
      await jobsAPI.addModelToJob(jobId, selectedModel);
      // Refresh job list
      const updatedJobs = await jobsAPI.getAllJobs();
      setJobs(updatedJobs);
      
      // Update selected job with new data
      if (selectedJob && selectedJob.jobId === jobId) {
        const updatedSelectedJob = updatedJobs.find(job => job.jobId === jobId);
        setSelectedJob(updatedSelectedJob);
      }
      
      setSelectedModel('');
    } catch (err) {
      setError(`Failed to add model to job ${jobId}`);
      console.error(err);
    }
  };

  const removeModelFromJob = async (jobId, modelId) => {
    try {
      setError('');
      await jobsAPI.removeModelFromJob(jobId, modelId);
      // Refresh job list
      const updatedJobs = await jobsAPI.getAllJobs();
      setJobs(updatedJobs);
      
      // Update selected job with new data
      if (selectedJob && selectedJob.jobId === jobId) {
        const updatedSelectedJob = updatedJobs.find(job => job.jobId === jobId);
        setSelectedJob(updatedSelectedJob);
      }
    } catch (err) {
      setError(`Failed to remove model from job ${jobId}`);
      console.error(err);
    }
  };

  const deleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    
    try {
      setError('');
      await jobsAPI.deleteJob(jobId);
      // Remove the job from the list
      setJobs(jobs.filter(job => job.jobId !== jobId));
      
      // If we deleted the selected job, clear the selection
      if (selectedJob && selectedJob.jobId === jobId) {
        setSelectedJob(null);
      }
    } catch (err) {
      setError(`Failed to delete job ${jobId}`);
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  return {
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
  };
} 