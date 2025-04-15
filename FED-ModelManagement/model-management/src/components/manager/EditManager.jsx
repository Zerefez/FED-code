import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { managersAPI } from '../../services/api';
import Button from '../common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import ErrorMessage from '../common/ErrorMessage';
import Input from '../common/Input';

export default function EditManager() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isManager } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchManager() {
      try {
        setLoading(true);
        const managerData = await managersAPI.getManager(id);
        setFormData({
          email: managerData.email,
          firstName: managerData.firstName,
          lastName: managerData.lastName
        });
      } catch (err) {
        setError('Failed to fetch manager details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    if (id) {
      fetchManager();
    } else {
      setLoading(false);
      setError('No manager ID provided');
    }
  }, [id]);

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
      await managersAPI.updateManager(id, formData);
      setSuccess(`Manager updated successfully!`);
      
      // Navigate back to managers list after a short delay
      setTimeout(() => {
        navigate('/managers');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update manager');
    } finally {
      setLoading(false);
    }
  };

  if (!isManager) {
    return (
      <div className="bg-yellow-100/20 border border-yellow-400 text-yellow-400 px-4 py-3 rounded-md mb-4">
        You do not have permission to edit managers.
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Manager: {formData.firstName} {formData.lastName}</CardTitle>
      </CardHeader>
      
      <CardContent>
        {error && <ErrorMessage error={error} />}
        
        {success && (
          <div className="bg-green-100/20 border border-green-400 text-green-400 px-4 py-3 rounded-md mb-4">
            {success}
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-6">Loading manager data...</div>
        ) : (
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
              
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground mb-4">
                  Note: Password cannot be edited here. For security reasons, please use the password change function instead.
                </p>
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
            
            <div className="flex justify-between mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/managers')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Manager'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
} 