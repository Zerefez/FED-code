import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';

export default function ModelList({ models, selectedModel, setSelectedModel }) {
  const navigate = useNavigate();

  const handleModelClick = (model) => {
    // Set the selected model in the state
    setSelectedModel(model);
    
    // Update the URL to include the model ID
    const modelId = model.id || model.modelId;
    navigate(`/models/${modelId}`, { replace: true });
  };

  return (
    <div className="lg:col-span-1">
      {models.length === 0 ? (
        <p className="text-muted-foreground">No models found.</p>
      ) : (
        <div className="overflow-y-auto max-h-[70vh] pr-2">
          <h2 className="text-xl font-semibold mb-3 text-foreground">Model Roster</h2>
          <div className="space-y-2">
            {models.map(model => (
              <div 
                key={model.id || model.modelId}
                onClick={() => handleModelClick(model)}
                className={cn(
                  "p-3 rounded-lg cursor-pointer transition-all",
                  selectedModel && (selectedModel.id === model.id || 
                                   selectedModel.modelId === model.modelId || 
                                   selectedModel.id === model.modelId || 
                                   selectedModel.modelId === model.id)
                    ? "bg-secondary/50 border-l-4 border-primary"
                    : "bg-secondary/20 hover:bg-secondary/30"
                )}
              >
                <div className="font-medium text-foreground">
                  {model.firstName} {model.lastName}
                </div>
                <div className="text-sm text-muted-foreground">{model.email}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

ModelList.propTypes = {
  models: PropTypes.array.isRequired,
  selectedModel: PropTypes.object,
  setSelectedModel: PropTypes.func.isRequired
}; 