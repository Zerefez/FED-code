import PropTypes from 'prop-types';
import Button from '../common/Button';
import Input from '../common/Input';

export default function JobInformation({ 
  job, 
  isEditing, 
  isManager, 
  editFormData, 
  handleEditChange, 
  handleEditSubmit, 
  formatDate 
}) {
  if (isEditing && isManager) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-3 text-foreground">Job Information</h2>
        <form onSubmit={handleEditSubmit} className="space-y-4 bg-secondary/20 p-4 rounded-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="customer" className="block text-sm font-medium text-foreground">
                Customer
              </label>
              <Input
                id="customer"
                name="customer"
                value={editFormData.customer}
                onChange={handleEditChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="startDate" className="block text-sm font-medium text-foreground">
                Start Date
              </label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={editFormData.startDate}
                onChange={handleEditChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="days" className="block text-sm font-medium text-foreground">
                Duration (days)
              </label>
              <Input
                id="days"
                name="days"
                type="number"
                min="1"
                value={editFormData.days}
                onChange={handleEditChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="location" className="block text-sm font-medium text-foreground">
                Location
              </label>
              <Input
                id="location"
                name="location"
                value={editFormData.location}
                onChange={handleEditChange}
                required
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="comments" className="block text-sm font-medium text-foreground">
                Comments
              </label>
              <Input
                id="comments"
                name="comments"
                value={editFormData.comments}
                onChange={handleEditChange}
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button type="submit" variant="default">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3 text-foreground">Job Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-secondary/20 p-4 rounded-md">
          <p className="mb-1 text-muted-foreground">
            <span className="font-medium text-foreground">Customer:</span> {job.customer}
          </p>
          <p className="mb-1 text-muted-foreground">
            <span className="font-medium text-foreground">Start Date:</span> {formatDate(job.startDate)}
          </p>
          <p className="mb-1 text-muted-foreground">
            <span className="font-medium text-foreground">Duration:</span> {job.days} day{job.days !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="bg-secondary/20 p-4 rounded-md">
          <p className="mb-1 text-muted-foreground">
            <span className="font-medium text-foreground">Location:</span> {job.location}
          </p>
          {job.comments && (
            <p className="mb-1 text-muted-foreground">
              <span className="font-medium text-foreground">Comments:</span> {job.comments}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

JobInformation.propTypes = {
  job: PropTypes.object.isRequired,
  isEditing: PropTypes.bool.isRequired,
  isManager: PropTypes.bool.isRequired,
  editFormData: PropTypes.object.isRequired,
  handleEditChange: PropTypes.func.isRequired,
  handleEditSubmit: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired
}; 