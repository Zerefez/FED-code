import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Button from '../common/Button';

export default function ModelDetail({ 
  selectedModel, 
  deleteModel, 
  formatDate, 
  isManager 
}) {
  return (
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
                  onClick={() => deleteModel(selectedModel.id || selectedModel.modelId)}
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
                  <p className="text-foreground">{selectedModel.phoneNo || 'N/A'}</p>
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
                  <p className="text-foreground">{selectedModel.height ? `${selectedModel.height} m` : 'N/A'}</p>
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
            <div className="bg-card border border-border p-3 rounded-md mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Comments</h3>
              <p className="text-foreground">{selectedModel.comments}</p>
            </div>
          )}

          {isManager && (
            <div className="flex justify-end">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/models/${selectedModel.modelId || selectedModel.id}/edit`}>
                  Edit Model
                </Link>
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-10 text-muted-foreground">
          <p>Select a model from the list to view details</p>
        </div>
      )}
    </div>
  );
}

ModelDetail.propTypes = {
  selectedModel: PropTypes.object,
  deleteModel: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired,
  isManager: PropTypes.bool.isRequired
}; 