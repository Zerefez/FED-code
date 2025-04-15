import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Button from '../common/Button';

export default function JobDetail({ 
  selectedJob, 
  formatDate, 
  isManager, 
  removeModelFromJob,
  selectedModel,
  setSelectedModel,
  models,
  addModelToJob
}) {
  if (!selectedJob) {
    return (
      <div className="bg-secondary/20 p-6 rounded-lg text-center text-muted-foreground">
        <p>Select a job to view details</p>
      </div>
    );
  }

  return (
    <div className="bg-secondary/20 p-6 rounded-lg">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold text-foreground">{selectedJob.customer}</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/jobs">
              Back to Jobs
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-card border border-border p-4 rounded-md">
          <h3 className="text-md font-semibold text-foreground mb-3">Job Details</h3>
          <div className="space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">Customer:</span>
              <p className="text-foreground">{selectedJob.customer}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Start Date:</span>
              <p className="text-foreground">{formatDate(selectedJob.startDate)}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Duration:</span>
              <p className="text-foreground">{selectedJob.days} day{selectedJob.days !== 1 ? 's' : ''}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Location:</span>
              <p className="text-foreground">{selectedJob.location}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card border border-border p-4 rounded-md">
          <h3 className="text-md font-semibold text-foreground mb-3">Comments</h3>
          <p className="text-muted-foreground">
            {selectedJob.comments || 'No comments available.'}
          </p>
        </div>
      </div>
      
      <div className="bg-card border border-border p-4 rounded-md mb-4">
        <h3 className="text-md font-semibold text-foreground mb-3">Assigned Models</h3>
        
        {selectedJob.models && selectedJob.models.length > 0 ? (
          <ul className="divide-y divide-border">
            {selectedJob.models.map(model => (
              <li key={model.modelId || model.id} className="py-2 flex items-center justify-between">
                <div>
                  <span className="font-medium text-foreground">{model.firstName} {model.lastName}</span>
                  <p className="text-sm text-muted-foreground">{model.email}</p>
                </div>
                {isManager && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => removeModelFromJob(selectedJob.jobId, model.modelId || model.id)}
                  >
                    Remove
                  </Button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No models are assigned to this job.</p>
        )}
        
        {isManager && (
          <div className="mt-4 pt-4 border-t border-border">
            <h4 className="text-sm font-semibold text-foreground mb-2">Add Model to Job</h4>
            <div className="flex space-x-2">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="flex-grow py-2 px-3 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select a model</option>
                {models.map(model => (
                  <option key={model.modelId || model.id} value={model.modelId || model.id}>
                    {model.firstName} {model.lastName}
                  </option>
                ))}
              </select>
              <Button
                onClick={() => addModelToJob(selectedJob.jobId)}
                disabled={!selectedModel}
              >
                Add
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

JobDetail.propTypes = {
  selectedJob: PropTypes.object,
  formatDate: PropTypes.func.isRequired,
  isManager: PropTypes.bool.isRequired,
  removeModelFromJob: PropTypes.func.isRequired,
  selectedModel: PropTypes.string.isRequired,
  setSelectedModel: PropTypes.func.isRequired,
  models: PropTypes.array.isRequired,
  addModelToJob: PropTypes.func.isRequired
}; 