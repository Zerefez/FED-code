import { accountAPI } from './api';

export async function login(email, password) {
  console.log('Auth service: login attempt', { email });
  try {
    console.log('Auth service: making API call to login');
    const response = await accountAPI.login(email, password);
    console.log('Auth service: login response:', response);
    
    if (typeof response === 'object') {
      console.log('Auth service: received object response with keys:', Object.keys(response));
    } else {
      console.log('Auth service: received direct token string');
    }
    
    return response;
  } catch (error) {
    console.error('Auth service: login error details:', error);
    console.error('Auth service: response data:', error.response?.data);
    console.error('Auth service: response status:', error.response?.status);
    console.error('Auth service: error stack:', error.stack);
    throw new Error(error.response?.data?.message || 'Login failed');
  }
}

export async function changePassword(oldPassword, newPassword) {
  console.log('Auth service: attempting to change password');
  try {
    const response = await accountAPI.changePassword({
      oldPassword,
      newPassword
    });
    console.log('Auth service: password change successful');
    return response;
  } catch (error) {
    console.error('Auth service: password change failed:', error);
    console.error('Auth service: response data:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Password change failed');
  }
}

export function decodeToken(token) {
  console.log('Auth service: decoding token');
  try {
    // Split the token and decode the payload
    const parts = token.split('.');
    console.log('Auth service: token parts count:', parts.length);
    
    if (parts.length !== 3) {
      console.error('Auth service: token does not have 3 parts, invalid JWT format');
      throw new Error('Invalid token format');
    }
    
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    try {
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const decoded = JSON.parse(jsonPayload);
      console.log('Auth service: token decoded successfully with claims:', Object.keys(decoded));
      return decoded;
    } catch (decodeError) {
      console.error('Auth service: error in decode/parse steps:', decodeError);
      throw decodeError;
    }
  } catch (error) {
    console.error('Auth service: error decoding token:', error);
    console.error('Auth service: error stack:', error.stack);
    throw new Error('Invalid token');
  }
}