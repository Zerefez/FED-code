import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { modelsAPI } from '../services/api';
import { cn } from '../utils/cn';
import Button from './common/Button';
import { Card, CardContent, CardHeader, CardTitle } from './common/Card';
import ErrorMessage from './common/ErrorMessage';

export default function Models() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedModel, setSelectedModel] = useState(null);
  const { isManager } = useAuth();

  useEffect(() => {
    async function fetchModels() {
      try {
        setLoading(true);
        const data = await modelsAPI.getAllModels();
        setModels(data);
      } catch (err) {
        setError('Failed to fetch models');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchModels();
  }, []);

  const deleteModel = async (id) => {
    if (!window.confirm('Are you sure you want to delete this model?')) return;
    
    try {
      await modelsAPI.deleteModel(id);
      
      // Remove from UI - handle either id or modelId property 
      setModels(models.filter(model => (model.id !== id && model.modelId !== id)));
      
      if (selectedModel && (selectedModel.id === id || selectedModel.modelId === id)) {
        setSelectedModel(null);
      }
    } catch (err) {
      setError('Failed to delete model');
      console.error(err);
    }
  };

  if (loading) return <div className="text-center py-10 text-foreground">Loading models...</div>;
  
  if (error) return <ErrorMessage error={error} />;

  if (!isManager) {
    return (
      <div className="bg-yellow-100/20 border border-yellow-400 text-yellow-400 px-4 py-3 rounded-md mb-4">
        You do not have permission to view models.
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
        <CardTitle>Models</CardTitle>
        {isManager && (
          <Button asChild>
            <Link to="/create-model">
              Create New Model
            </Link>
          </Button>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel - Model list */}
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
                      onClick={() => setSelectedModel(model)}
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
          
          {/* Right panel - Selected model details */}
          <div className="lg:col-span-2 bg-secondary/20 rounded-lg p-4">
            {selectedModel ? (
              <div>
                <div className="flex justify-between items-start">
                  <h2 className="text-2xl font-bold mb-4 text-foreground">
                    {selectedModel.firstName} {selectedModel.lastName}
                  </h2>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/models/${selectedModel.modelId || selectedModel.id}/jobs`}>
                        Jobs
                      </Link>
                    </Button>
                    {isManager && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteModel(selectedModel.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-card border border-border p-3 rounded-md">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Contact Information</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-muted-foreground text-sm">Email:</span>
                        <p className="text-foreground">{selectedModel.email}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-sm">Phone:</span>
                        <p className="text-foreground">{selectedModel.phoneNo}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border p-3 rounded-md">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Personal Details</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-muted-foreground text-sm">Birth Date:</span>
                        <p className="text-foreground">{formatDate(selectedModel.birthDate || selectedModel.birthDay)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-sm">Nationality:</span>
                        <p className="text-foreground">{selectedModel.nationality || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border p-3 rounded-md">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Address</h3>
                    <div className="space-y-2 text-foreground">
                      <p>{selectedModel.addressLine1 || 'N/A'}</p>
                      {selectedModel.addressLine2 && <p>{selectedModel.addressLine2}</p>}
                      <p>
                        {selectedModel.city && `${selectedModel.city}, `}
                        {selectedModel.zip}
                        {selectedModel.country && `, ${selectedModel.country}`}
                      </p>
                    </div>
                  </div>

                  <div className="bg-card border border-border p-3 rounded-md">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Physical Attributes</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-muted-foreground text-sm">Height:</span>
                        <p className="text-foreground">{selectedModel.height || 'N/A'} m</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-sm">Shoe Size:</span>
                        <p className="text-foreground">{selectedModel.shoeSize || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-sm">Hair Color:</span>
                        <p className="text-foreground">{selectedModel.hairColor || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-sm">Eye Color:</span>
                        <p className="text-foreground">{selectedModel.eyeColor || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedModel.comments && (
                  <div className="bg-card border border-border p-3 rounded-md">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Comments</h3>
                    <p className="text-foreground">{selectedModel.comments}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>Select a model to view details</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 