import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useJobDetail from '../hooks/useJobDetail';
import Button from './common/Button';
import { Card, CardContent, CardHeader, CardTitle } from './common/Card';
import ErrorMessage from './common/ErrorMessage';
import JobExpenses from './job/JobExpenses';
import JobInformation from './job/JobInformation';
import JobModels from './job/JobModels';

export default function JobDetail() {
  const { id } = useParams();
  const { isManager, isModel, getModelId } = useAuth();
  
  const {
    job,
    availableModels,
    selectedModel,
    setSelectedModel,
    expenses,
    loading,
    error,
    isEditing,
    setIsEditing,
    editFormData,
    handleEditChange,
    handleEditSubmit,
    addModelToJob,
    removeModelFromJob,
    deleteJob,
    formatDate,
    isModelAssignedToJob
  } = useJobDetail(id);

  // Get the current model's ID for redirects to expense management
  const currentModelId = getModelId();

  if (loading) return <div className="text-center py-10 text-foreground">Loading job details...</div>;
  
  if (error) return <ErrorMessage error={error} />;
  
  if (!job) return <div className="text-center py-10 text-foreground">Job not found</div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Job Details: {job.customer}</CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link to="/jobs">Back to Jobs</Link>
          </Button>
          {isManager && (
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
              <Button variant="destructive" onClick={deleteJob}>
                Delete Job
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <JobInformation
          job={job}
          isEditing={isEditing}
          isManager={isManager}
          editFormData={editFormData}
          handleEditChange={handleEditChange}
          handleEditSubmit={handleEditSubmit}
          formatDate={formatDate}
        />
        
        <JobModels
          job={job}
          isManager={isManager}
          availableModels={availableModels}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          addModelToJob={addModelToJob}
          removeModelFromJob={removeModelFromJob}
        />
        
        {/* Display expenses in a read-only view with links to manage them in the model expenses section */}
        <JobExpenses
          expenses={expenses}
          formatDate={formatDate}
          isManager={isManager}
          isModel={isModel}
          isModelAssignedToJob={isModelAssignedToJob}
          currentModelId={currentModelId}
        />
      </CardContent>
    </Card>
  );
} 