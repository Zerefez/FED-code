import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { managersAPI } from '../../services/api';
import Button from '../common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import ErrorMessage from '../common/ErrorMessage';
import Input from '../common/Input';

export default function CreateManager() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
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
      await managersAPI.createManager(formData);
      setSuccess(`Manager ${formData.email} created successfully!`);
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: ''
      });

      // Navigate to managers list after a short delay
      setTimeout(() => {
        navigate('/managers');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create manager');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Manager</CardTitle>
      </CardHeader>
      
      <CardContent>
        {error && <ErrorMessage error={error} />}
        
        {success && (
          <div className="bg-green-100/20 border border-green-400 text-green-400 px-4 py-3 rounded-md mb-4">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email</label>
              <Input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Password</label>
              <Input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">First Name</label>
              <Input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Last Name</label>
              <Input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="mt-6">
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Creating...' : 'Create Manager'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}