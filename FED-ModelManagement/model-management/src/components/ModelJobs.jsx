import { Link, useParams } from 'react-router-dom';
import useModelJobs from '../hooks/useModelJobs';
import Button from './common/Button';
import { Card, CardContent, CardHeader, CardTitle } from './common/Card';
import ErrorMessage from './common/ErrorMessage';
import ModelInfo from './model/ModelInfo';
import ModelJobsList from './model/ModelJobsList';

export default function ModelJobs() {
  const { id } = useParams();
  const { model, loading, error, canViewModelJobs, formatDate } = useModelJobs(id);

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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Jobs for {model.firstName} {model.lastName}</CardTitle>
        <Button variant="outline" asChild>
          <Link to="/models">Back to Models</Link>
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <ModelInfo model={model} />
        <ModelJobsList model={model} formatDate={formatDate} />
      </CardContent>
    </Card>
  );
} 