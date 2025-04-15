import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';
import Button from '../common/Button';

export default function ModelJobsList({ model, formatDate }) {
  // Make sure model.jobs is always an array
  const jobs = Array.isArray(model.jobs) ? model.jobs : [];
  const hasJobs = jobs.length > 0;
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3 text-foreground">Jobs</h2>
      
      {!hasJobs ? (
        <p className="bg-secondary/20 p-4 rounded-md text-muted-foreground">No jobs assigned to this model.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Days
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job, idx) => (
                <tr key={job.jobId || job.id} className={cn("border-b border-border", idx % 2 === 0 ? "bg-card" : "bg-secondary/10")}>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/jobs/${job.jobId || job.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

ModelJobsList.propTypes = {
  model: PropTypes.object.isRequired,
  formatDate: PropTypes.func.isRequired
}; 