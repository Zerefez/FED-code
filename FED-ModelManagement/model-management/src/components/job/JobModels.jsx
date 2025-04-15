import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';
import Button from '../common/Button';

export default function JobModels({ 
  job, 
  isManager, 
  availableModels, 
  selectedModel, 
  setSelectedModel, 
  addModelToJob, 
  removeModelFromJob 
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3 text-foreground">Models</h2>
      
      {job.models && job.models.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {job.models.map((model, idx) => (
                <tr key={model.id || model.modelId} className={cn("border-b border-border", idx % 2 === 0 ? "bg-card" : "bg-secondary/10")}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    {model.firstName} {model.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {model.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/models/${model.id || model.modelId}`}>
                          View Model
                        </Link>
                      </Button>
                      {isManager && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeModelFromJob(model.id || model.modelId)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="bg-secondary/20 p-4 rounded-md text-muted-foreground">No models assigned to this job yet.</p>
      )}
      
      {isManager && (
        <div className="mt-4 p-4 bg-secondary/20 rounded-md">
          <h3 className="text-lg font-medium mb-2 text-foreground">Add Model to Job</h3>
          {availableModels.length > 0 ? (
            <div className="flex items-end space-x-2">
              <div className="flex-grow">
                <label htmlFor="modelSelect" className="block text-sm font-medium mb-1 text-foreground">
                  Select Model
                </label>
                <select
                  id="modelSelect"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                >
                  <option value="">Select a model...</option>
                  {availableModels.map(model => (
                    <option key={model.id || model.modelId} value={model.id || model.modelId}>
                      {model.firstName} {model.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <Button 
                variant="default" 
                onClick={addModelToJob}
                disabled={!selectedModel}
              >
                Add Model
              </Button>
            </div>
          ) : (
            <p className="text-muted-foreground">All models are already assigned to this job.</p>
          )}
        </div>
      )}
    </div>
  );
}

JobModels.propTypes = {
  job: PropTypes.object.isRequired,
  isManager: PropTypes.bool.isRequired,
  availableModels: PropTypes.array.isRequired,
  selectedModel: PropTypes.string.isRequired,
  setSelectedModel: PropTypes.func.isRequired,
  addModelToJob: PropTypes.func.isRequired,
  removeModelFromJob: PropTypes.func.isRequired
}; 