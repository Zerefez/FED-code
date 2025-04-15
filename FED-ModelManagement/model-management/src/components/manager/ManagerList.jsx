import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';

export default function ManagerList({ managers, selectedManager, setSelectedManager }) {
  const navigate = useNavigate();

  const handleManagerClick = (manager) => {
    // Set the selected manager in the state
    setSelectedManager(manager);
    
    // Update the URL to include the manager ID
    navigate(`/managers/${manager.managerId}`, { replace: true });
  };

  return (
    <div className="lg:col-span-1">
      {managers.length === 0 ? (
        <p className="text-muted-foreground">No managers found.</p>
      ) : (
        <div className="overflow-y-auto max-h-[70vh] pr-2">
          <h2 className="text-xl font-semibold mb-3 text-foreground">Manager Roster</h2>
          <div className="space-y-2">
            {managers.map(manager => (
              <div 
                key={manager.managerId}
                onClick={() => handleManagerClick(manager)}
                className={cn(
                  "p-3 rounded-lg cursor-pointer transition-all",
                  selectedManager && selectedManager.managerId === manager.managerId
                    ? "bg-secondary/50 border-l-4 border-primary"
                    : "bg-secondary/20 hover:bg-secondary/30"
                )}
              >
                <div className="font-medium text-foreground">
                  {manager.firstName} {manager.lastName}
                </div>
                <div className="text-sm text-muted-foreground">{manager.email}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

ManagerList.propTypes = {
  managers: PropTypes.array.isRequired,
  selectedManager: PropTypes.object,
  setSelectedManager: PropTypes.func.isRequired
}; 