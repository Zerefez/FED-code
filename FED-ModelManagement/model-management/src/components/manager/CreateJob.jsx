import { useState } from 'react';
import { jobsAPI } from '../../services/api';
import { cn } from '../../utils/cn';
import Button from '../common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import ErrorMessage from '../common/ErrorMessage';
import Input from '../common/Input';

export default function CreateJob() {
  const [formData, setFormData] = useState({
    customer: '',
    startDate: '',
    days: 1,
    location: '',
    comments: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      // Format the data as needed for the API
      const jobData = {
        ...formData,
        days: parseInt(formData.days),
        startDate: new Date(formData.startDate).toISOString()
      };
      
      await jobsAPI.createJob(jobData);
      setSuccess('Job created successfully!');
      setFormData({
        customer: '',
        startDate: '',
        days: 1,
        location: '',
        comments: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Job</CardTitle>
      </CardHeader>
      
      <CardContent>
        {error && <ErrorMessage error={error} />}
        
        {success && (
          <div className="bg-green-100/20 border border-green-400 text-green-400 px-4 py-3 rounded-md mb-4">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Customer</label>
              <Input
                type="text"
                name="customer"
                required
                value={formData.customer}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Start Date</label>
              <Input
                type="date"
                name="startDate"
                required
                value={formData.startDate}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Days</label>
              <Input
                type="number"
                name="days"
                min="1"
                required
                value={formData.days}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Location</label>
              <Input
                type="text"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Comments</label>
              <textarea
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                rows="4"
                className={cn(
                  "flex w-full rounded-md border border-input bg-background px-3 py-2",
                  "text-sm ring-offset-background",
                  "placeholder:text-muted-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
              ></textarea>
            </div>
            
            <div className="pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Creating...' : 'Create Job'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}