import { Link, useParams } from 'react-router-dom';
import useModelsList from '../hooks/useModelsList';
import Button from './common/Button';
import { Card, CardContent, CardHeader, CardTitle } from './common/Card';
import ErrorMessage from './common/ErrorMessage';
import ModelDetail from './model/ModelDetail';
import ModelList from './model/ModelList';

export default function Models() {
  const { id } = useParams();
  const {
    models,
    loading, 
    error,
    selectedModel,
    setSelectedModel,
    deleteModel,
    formatDate,
    isManager
  } = useModelsList();

  if (loading) return <div className="text-center py-10 text-foreground">Loading models...</div>;
  
  if (error) return <ErrorMessage error={error} />;

  if (!isManager) {
    return (
      <div className="bg-yellow-100/20 border border-yellow-400 text-yellow-400 px-4 py-3 rounded-md mb-4">
        You do not have permission to view models.
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {id && selectedModel 
            ? `Model: ${selectedModel.firstName} ${selectedModel.lastName}` 
            : 'Models'}
        </CardTitle>
        <div className="flex space-x-2">
          {id && (
            <Button variant="outline" asChild>
              <Link to="/models">Back to Models</Link>
            </Button>
          )}
          {isManager && (
            <Button asChild>
              <Link to="/create-model">
                Create New Model
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel - Model list */}
          <ModelList 
            models={models} 
            selectedModel={selectedModel} 
            setSelectedModel={setSelectedModel} 
          />
          
          {/* Right panel - Selected model details */}
          <ModelDetail 
            selectedModel={selectedModel}
            deleteModel={deleteModel}
            formatDate={formatDate}
            isManager={isManager}
          />
        </div>
      </CardContent>
    </Card>
  );
} 