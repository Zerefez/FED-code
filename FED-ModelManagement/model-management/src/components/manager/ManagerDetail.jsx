import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Button from '../common/Button';

export default function ManagerDetail({ selectedManager, deleteManager }) {
  if (!selectedManager) {
    return (
      <div className="lg:col-span-2 bg-secondary/20 rounded-lg p-4 text-center">
        <p className="text-muted-foreground">Select a manager to view details</p>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2 bg-secondary/20 rounded-lg p-4">
      <div className="flex justify-between items-start">
        <h2 className="text-2xl font-bold mb-4 text-foreground">
          {selectedManager.firstName} {selectedManager.lastName}
        </h2>
        <div className="flex space-x-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => deleteManager(selectedManager.managerId)}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-4">
        <div className="bg-card border border-border p-3 rounded-md">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Contact Information</h3>
          <div className="space-y-2">
            <div>
              <span className="text-muted-foreground text-sm">Name:</span>
              <p className="text-foreground">{selectedManager.firstName} {selectedManager.lastName}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-sm">Email:</span>
              <p className="text-foreground">{selectedManager.email}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-sm">Manager ID:</span>
              <p className="text-foreground">{selectedManager.managerId}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border p-3 rounded-md">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Role & Responsibilities</h3>
          <div className="space-y-2">
            <div>
              <span className="text-muted-foreground text-sm">Role:</span>
              <p className="text-foreground">Model Manager</p>
            </div>
            <div>
              <span className="text-muted-foreground text-sm">Responsibilities:</span>
              <ul className="list-disc pl-5 mt-1 text-sm text-foreground">
                <li>Manage models and their portfolio</li>
                <li>Coordinate jobs and assignments</li>
                <li>Handle client relationships</li>
                <li>Manage expenses and payments</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border p-3 rounded-md">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">System Access</h3>
          <div className="space-y-2">
            <div>
              <span className="text-muted-foreground text-sm">Access Level:</span>
              <p className="text-foreground">Full administrative access</p>
            </div>
            <div>
              <span className="text-muted-foreground text-sm">Permissions:</span>
              <ul className="list-disc pl-5 mt-1 text-sm text-foreground">
                <li>Create, edit and delete models</li>
                <li>Manage job assignments</li>
                <li>Approve expenses</li>
                <li>Generate reports</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/managers/${selectedManager.managerId}/edit`}>
            Edit Manager
          </Link>
        </Button>
      </div>
    </div>
  );
}

ManagerDetail.propTypes = {
  selectedManager: PropTypes.object,
  deleteManager: PropTypes.func.isRequired
}; 