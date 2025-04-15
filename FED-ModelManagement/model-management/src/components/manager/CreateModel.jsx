import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { modelsAPI } from '../../services/api';
import { cn } from '../../utils/cn';
import Button from '../common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import ErrorMessage from '../common/ErrorMessage';
import Input from '../common/Input';

export default function CreateModel() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNo: '',
    addressLine1: '',
    addressLine2: '',
    zip: '',
    city: '',
    country: '',
    nationality: '',
    height: '',
    shoeSize: '',
    hairColor: '',
    eyeColor: '',
    comments: '',
    birthYear: new Date().getFullYear() - 18,
    birthMonth: 1,
    birthDay: 1
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBirthdayChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseInt(value, 10) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      // Format the data as needed for the API
      const modelData = {
        ...formData,
        birthYear: parseInt(formData.birthYear, 10),
        birthMonth: parseInt(formData.birthMonth, 10),
        birthDay: parseInt(formData.birthDay, 10)
      };
      
      await modelsAPI.createModel(modelData);
      setSuccess(`Model ${formData.email} created successfully!`);
      // Reset form
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phoneNo: '',
        addressLine1: '',
        addressLine2: '',
        zip: '',
        city: '',
        country: '',
        nationality: '',
        height: '',
        shoeSize: '',
        hairColor: '',
        eyeColor: '',
        comments: '',
        birthYear: new Date().getFullYear() - 18,
        birthMonth: 1,
        birthDay: 1
      });
      
      // Navigate to models list after a short delay
      setTimeout(() => {
        navigate('/models');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create model');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Model</CardTitle>
      </CardHeader>
      
      <CardContent>
        {error && <ErrorMessage error={error} />}
        
        {success && (
          <div className="bg-green-100/20 border border-green-400 text-green-400 px-4 py-3 rounded-md mb-4">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-lg font-medium text-foreground mb-3">Account Information</h2>
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
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-medium text-foreground mb-3">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
                <Input
                  type="text"
                  name="phoneNo"
                  value={formData.phoneNo}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Birth Date</label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs text-muted-foreground">Day</label>
                    <Input
                      type="number"
                      name="birthDay"
                      min="1"
                      max="31"
                      required
                      value={formData.birthDay}
                      onChange={handleBirthdayChange}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground">Month</label>
                    <Input
                      type="number"
                      name="birthMonth"
                      min="1"
                      max="12"
                      required
                      value={formData.birthMonth}
                      onChange={handleBirthdayChange}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground">Year</label>
                    <Input
                      type="number"
                      name="birthYear"
                      min="1900"
                      max={new Date().getFullYear()}
                      required
                      value={formData.birthYear}
                      onChange={handleBirthdayChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-medium text-foreground mb-3">Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1">Address Line 1</label>
                <Input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1">Address Line 2</label>
                <Input
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Zip Code</label>
                <Input
                  type="text"
                  name="zip"
                  value={formData.zip}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">City</label>
                <Input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Country</label>
                <Input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nationality</label>
                <Input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-medium text-foreground mb-3">Attributes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Height (cm)</label>
                <Input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Shoe Size (EU)</label>
                <Input
                  type="number"
                  name="shoeSize"
                  value={formData.shoeSize}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Hair Color</label>
                <Input
                  type="text"
                  name="hairColor"
                  value={formData.hairColor}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Eye Color</label>
                <Input
                  type="text"
                  name="eyeColor"
                  value={formData.eyeColor}
                  onChange={handleChange}
                />
              </div>
              
              <div className="md:col-span-2">
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
            </div>
          </div>
          
          <div className="pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Creating...' : 'Create Model'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}