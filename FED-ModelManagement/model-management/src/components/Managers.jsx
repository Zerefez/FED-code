import { Link, useParams } from 'react-router-dom';
import useManagersList from '../hooks/useManagersList';
import Button from './common/Button';
import { Card, CardContent, CardHeader, CardTitle } from './common/Card';
import ErrorMessage from './common/ErrorMessage';
import ManagerDetail from './manager/ManagerDetail';
import ManagerList from './manager/ManagerList';

export default function Managers() {
  const { id } = useParams();
  const {
    managers,
    loading,
    error,
    selectedManager,
    setSelectedManager,
    deleteManager,
    isManager
  } = useManagersList();

  if (loading) return <div className="text-center py-10 text-foreground">Loading managers...</div>;
  
  if (error) return <ErrorMessage error={error} />;

  if (!isManager) {
    return (
      <div className="bg-yellow-100/20 border border-yellow-400 text-yellow-400 px-4 py-3 rounded-md mb-4">
        You do not have permission to view managers.
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {id && selectedManager 
            ? `Manager: ${selectedManager.firstName} ${selectedManager.lastName}` 
            : 'Managers'}
        </CardTitle>
        <div className="flex space-x-2">
          {id && (
            <Button variant="outline" asChild>
              <Link to="/managers">Back to Managers</Link>
            </Button>
          )}
          <Button asChild>
            <Link to="/create-manager">
              Create New Manager
            </Link>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel - Manager list */}
          <ManagerList 
            managers={managers} 
            selectedManager={selectedManager} 
            setSelectedManager={setSelectedManager} 
          />
          
          {/* Right panel - Selected manager details */}
          <ManagerDetail 
            selectedManager={selectedManager}
            deleteManager={deleteManager}
          />
        </div>
      </CardContent>
    </Card>
  );
} 