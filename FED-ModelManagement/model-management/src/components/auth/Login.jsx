import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../common/Card';
import ErrorMessage from '../common/ErrorMessage';
import Input from '../common/Input';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, authError, clearAuthError } = useAuth();
  const navigate = useNavigate();

  console.log('Login component rendered, authError:', authError);

  // Clear auth errors when component unmounts or when inputs change
  useEffect(() => {
    console.log('Login component cleanup effect');
    return () => {
      console.log('Login component unmounting, clearing auth errors');
      clearAuthError();
    }
  }, [clearAuthError]);

  useEffect(() => {
    if (email || password) {
      console.log('Login inputs changed, clearing previous auth errors');
      clearAuthError();
    }
  }, [email, password, clearAuthError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Login form submitted for email:', email);
    setLoading(true);
    
    try {
      console.log('Attempting login...');
      const success = await login(email, password);
      
      console.log('Login attempt result:', success);
      if (success) {
        console.log('Login successful, navigating to dashboard');
        navigate('/dashboard');
      } else {
        console.log('Login failed, error should be in auth context');
      }
      // If login fails, the error will be set in the auth context
    } catch (err) {
      // This should be handled by the authContext's login method
      console.error('Unexpected error during login:', err);
    } finally {
      console.log('Login attempt completed, setting loading to false');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Model Management</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </CardHeader>
          
          <CardContent>
            <ErrorMessage error={authError} />
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email-address" className="block text-sm font-medium text-foreground mb-1">
                    Email address
                  </label>
                  <Input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                    Password
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}