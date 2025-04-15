import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { modelsAPI } from '../services/api';
import * as authService from '../services/auth';
import { formatErrorMessage } from '../utils/errorHandling';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [modelData, setModelData] = useState(null);
  const [modelLoading, setModelLoading] = useState(false);
  const [modelError, setModelError] = useState(null);
  const navigate = useNavigate();

  console.log('AuthContext initialized');

  // Helper function to parse claims from token
  const parseTokenClaims = (decodedToken) => {
    console.log('Parsing token claims:', decodedToken);
    // Extract common claims from Microsoft format or direct properties
    return {
      email: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || decodedToken.email || '',
      role: decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decodedToken.role || '',
      sub: decodedToken.sub || decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || '',
      firstName: decodedToken.firstName || decodedToken.given_name || '',
      lastName: decodedToken.lastName || decodedToken.family_name || '',
      name: decodedToken.name || '',
      modelId: decodedToken.modelId || null
    };
  };

  // Function to check if token is expired
  const isTokenExpired = (token) => {
    try {
      const decodedToken = authService.decodeToken(token);
      const currentTime = Date.now() / 1000;
      const isExpired = decodedToken.exp && decodedToken.exp < currentTime;
      console.log('Token expiration check:', { 
        tokenExp: decodedToken.exp, 
        currentTime, 
        isExpired 
      });
      return isExpired;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true; // Consider invalid tokens as expired
    }
  };

  // Load model data if user is a model
  const loadModelData = async (identifier) => {
    if (!identifier) return;
    
    setModelLoading(true);
    setModelError(null);
    
    try {
      console.log(`Loading model data for identifier: ${identifier}`);
      // Try to load by modelId first, if not available, try to search by email
      let data;
      try {
        data = await modelsAPI.getModel(identifier);
      } catch (error) {
        if (error.status === 404 && currentUser?.email) {
          // If model not found by ID, try to find by email
          console.log(`Model not found by ID, searching by email: ${currentUser.email}`);
          const allModels = await modelsAPI.getAllModels();
          data = allModels.find(model => 
            model.email && model.email.toLowerCase() === currentUser.email.toLowerCase()
          );
          
          if (!data) {
            throw new Error('Model not found by email');
          }
        } else {
          throw error;
        }
      }
      
      console.log('Model data loaded:', data);
      
      // Update current user with the real model ID from the API
      if (data && data.id && currentUser) {
        console.log(`Updating current user with model ID: ${data.id}`);
        setCurrentUser(prevUser => ({
          ...prevUser,
          modelId: data.id
        }));
      }
      
      setModelData(data);
    } catch (error) {
      console.error('Failed to load model data:', error);
      setModelError(formatErrorMessage(error, 'Failed to load model information.'));
    } finally {
      setModelLoading(false);
    }
  };
  
  // Update model data
  const updateModelData = async (modelId, updateData) => {
    if (!modelId) return;
    
    setModelLoading(true);
    setModelError(null);
    
    try {
      console.log(`Updating model data for model ID: ${modelId}`, updateData);
      const data = await modelsAPI.updateModel(modelId, updateData);
      console.log('Model data updated:', data);
      setModelData(data);
      return data;
    } catch (error) {
      console.error('Failed to update model data:', error);
      setModelError(formatErrorMessage(error, 'Failed to update model information.'));
      throw error;
    } finally {
      setModelLoading(false);
    }
  };

  // Get model jobs
  const getModelJobs = async (modelId) => {
    if (!modelId) return [];
    
    try {
      console.log(`Getting jobs for model ID: ${modelId}`);
      const jobs = await modelsAPI.getModelJobs(modelId);
      console.log('Model jobs loaded:', jobs);
      return jobs;
    } catch (error) {
      console.error('Failed to get model jobs:', error);
      setModelError(formatErrorMessage(error, 'Failed to load model jobs.'));
      return [];
    }
  };

  useEffect(() => {
    console.log('AuthContext useEffect running - checking stored token');
    // Check if there's a token in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Found token in localStorage');
      // Check if token is expired
      if (isTokenExpired(token)) {
        console.log('Token expired, logging out');
        localStorage.removeItem('token');
        setLoading(false);
        return;
      }

      try {
        console.log('Decoding valid token');
        const decodedToken = authService.decodeToken(token);
        
        const claims = parseTokenClaims(decodedToken);
        console.log('Extracted claims:', claims);
        
        const userData = {
          email: claims.email,
          firstName: claims.firstName,
          lastName: claims.lastName,
          role: claims.role,
          isManager: claims.role.toLowerCase() === 'manager',
          modelId: claims.modelId,
          token
        };
        
        console.log('Setting current user:', userData);
        setCurrentUser(userData);
        
        // Load model data if this user is a model
        if (claims.modelId || claims.role.toLowerCase() === 'model') {
          loadModelData(claims.modelId || userData.email);
        }
      } catch (error) {
        console.error('Invalid token', error);
        localStorage.removeItem('token');
      }
    } else {
      console.log('No token found in localStorage');
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    console.log('Login attempt for:', email);
    try {
      setAuthError(null);
      const data = await authService.login(email, password);
      console.log('Login response received:', data);
      
      // Check if we have a valid token (either string directly or jwt property)
      let token = data;
      if (typeof data === 'object' && data.jwt) {
        token = data.jwt;
      }
      
      if (!token || typeof token !== 'string') {
        const error = new Error('Invalid token format received from server');
        setAuthError('Authentication failed: Invalid response from server');
        console.error(error, token);
        return false;
      }
      
      console.log('Valid token received, storing in localStorage');
      localStorage.setItem('token', token);
      
      try {
        console.log('Decoding token after login');
        const decodedToken = authService.decodeToken(token);
        
        const claims = parseTokenClaims(decodedToken);
        console.log('Login: Extracted claims:', claims);
        
        const userData = {
          email: claims.email,
          firstName: claims.firstName,
          lastName: claims.lastName,
          role: claims.role,
          isManager: claims.role.toLowerCase() === 'manager',
          modelId: claims.modelId,
          token
        };
        
        console.log('Login: Setting current user:', userData);
        setCurrentUser(userData);
        
        // Load model data if this user is a model
        if (claims.modelId || claims.role.toLowerCase() === 'model') {
          loadModelData(claims.modelId || userData.email);
        }
        
        console.log('Login successful');
        return true;
      } catch (tokenError) {
        setAuthError('Authentication failed: Invalid token');
        console.error('Token decode error:', tokenError);
        localStorage.removeItem('token');
        return false;
      }
    } catch (error) {
      const errorMessage = formatErrorMessage(
        error, 
        'Login failed. Please check your credentials and try again.'
      );
      setAuthError(errorMessage);
      console.error('Login failed in context:', error);
      return false;
    }
  };

  const logout = () => {
    console.log('Logging out user:', currentUser?.email);
    localStorage.removeItem('token');
    setCurrentUser(null);
    setModelData(null);
    navigate('/login');
    console.log('Logout complete, redirected to login');
  };

  const clearAuthError = () => {
    console.log('Clearing auth error');
    setAuthError(null);
  };
  
  const clearModelError = () => {
    console.log('Clearing model error');
    setModelError(null);
  };

  const value = {
    currentUser,
    authError,
    clearAuthError,
    login,
    logout,
    isAuthenticated: !!currentUser,
    isManager: currentUser?.isManager || false,
    isModel: currentUser ? (currentUser.role?.toLowerCase() === 'model' || !!currentUser.modelId) : false,
    // Helper functions
    getFullName: () => currentUser ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() : '',
    // Model-specific state and functions
    modelData,
    modelLoading,
    modelError,
    clearModelError,
    updateModelData: (updateData) => {
      const id = currentUser?.modelId || modelData?.id;
      return updateModelData(id, updateData);
    },
    getModelJobs: () => getModelJobs(currentUser?.modelId || modelData?.id),
    refreshModelData: () => loadModelData(currentUser?.modelId || currentUser?.email),
    // Add direct access to model ID with fallbacks
    getModelId: () => currentUser?.modelId || modelData?.id || (currentUser?.role?.toLowerCase() === 'model' ? currentUser?.email : null)
  };

  console.log('AuthContext value updated:', {
    isAuthenticated: !!currentUser,
    isManager: currentUser?.isManager || false,
    isModel: currentUser ? (currentUser.role?.toLowerCase() === 'model' || !!currentUser.modelId) : false,
    hasError: !!authError,
    hasModelData: !!modelData,
    hasModelError: !!modelError
  });

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}