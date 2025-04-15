import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';

export default function JobList({ 
  jobs, 
  selectedJob, 
  setSelectedJob, 
  formatDate, 
  isManager, 
  deleteJob
}) {
  const navigate = useNavigate();

  const handleJobClick = (job) => {
    // Set the selected job in the state
    setSelectedJob(job);
    
    // Update the URL to include the job ID
    navigate(`/jobs/${job.jobId}`, { replace: true });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="bg-secondary/20">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Customer
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Start Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Days
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Location
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Models
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {jobs.map((job, idx) => (
            <tr 
              key={job.jobId} 
              className={idx % 2 === 0 ? "bg-secondary/10" : ""}
              onClick={() => handleJobClick(job)}
              style={{ cursor: 'pointer' }}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                {job.customer}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                {formatDate(job.startDate)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                {job.days}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                {job.location}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                {job.models && job.models.length > 0 ? (
                  <span>{job.models.length} model{job.models.length > 1 ? 's' : ''}</span>
                ) : (
                  <span className="italic">None</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2 flex" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleJobClick(job)}
                >
                  View Details
                </Button>
                {isManager && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteJob(job.jobId)}
                  >
                    Delete
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

JobList.propTypes = {
  jobs: PropTypes.array.isRequired,
  selectedJob: PropTypes.object,
  setSelectedJob: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired,
  isManager: PropTypes.bool.isRequired,
  deleteJob: PropTypes.func.isRequired
}; 