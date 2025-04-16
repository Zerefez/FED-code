import axios from 'axios';

// Determine the API base URL based on the current environment
// When running in development, the API should be at the same host but on port 8080
// For Docker deployments, it might be at a different location
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'; 
console.log('API Service: initialized with base URL:', API_URL);

// Custom error class for API errors
export class APIError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000 // Set a timeout of 10 seconds
});

console.log('API Service: axios instance created with timeout:', api.defaults.timeout);

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('API Service: Adding auth token to request:', config.url);
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('API Service: No auth token available for request:', config.url);
    }
    
    // Add additional headers for troubleshooting
    config.headers['X-Client-Version'] = '1.0.0';
    config.headers['X-Request-ID'] = Date.now().toString();
    
    // Add detailed logging for URLs with parameters
    if (config.url && (config.url.includes('?') || config.url.includes('/'))) {
      console.log('API Service: Request URL details:', {
        url: config.url,
        method: config.method,
        params: config.params || 'none'
      });
    }
    
    return config;
  },
  (error) => {
    console.error('API Service: Request interceptor error:', error);
    return Promise.reject(
      new APIError('Error preparing the request', null, error)
    );
  }
);

// Add a response interceptor for global error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Service: Response received for ${response.config.method.toUpperCase()} ${response.config.url}:`, {
      status: response.status,
      statusText: response.statusText,
      dataSize: response.data ? (typeof response.data === 'string' ? response.data.length : JSON.stringify(response.data).length) : 0
    });
    return response;
  },
  (error) => {
    console.error('API Service: Response error:', error.message);
    
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      console.error('API Service: Authentication error (401) - clearing token');
      // Clear token if it's invalid or expired
      localStorage.removeItem('token');
      // Redirect to login page if we have access to window
      if (typeof window !== 'undefined') {
        console.log('API Service: Redirecting to login page due to auth error');
        window.location.href = '/login';
      }
    }
    
    // Create a standardized error object
    const errorMessage = error.response?.data?.message || error.message || 'Unknown API error';
    const status = error.response?.status;
    const errorData = error.response?.data;
    
    // Handle network errors specially
    if (error.code === 'ECONNABORTED') {
      console.error('API Service: Network timeout error:', errorMessage);
      return Promise.reject(new APIError('Request timed out. Please try again later.', 408));
    }
    
    if (!error.response) {
      console.error('API Service: Network error:', errorMessage);
      return Promise.reject(new APIError('Network error. Please check your connection.', 0));
    }
    
    // Log the error details
    console.error(`API Service: Error (${status}) for ${error.config?.method?.toUpperCase() || 'UNKNOWN'} ${error.config?.url || 'UNKNOWN'}:`, errorData || errorMessage);
    
    // Return a standardized error object
    return Promise.reject(new APIError(errorMessage, status, errorData));
  }
);

// Helper function to handle common error patterns
const handleApiError = (error, operation) => {
  let errorMessage = 'An unexpected error occurred';
  
  if (error instanceof APIError) {
    // Already formatted error
    throw error;
  }
  
  if (error.response) {
    // Server responded with a non-2xx status
    const status = error.response.status;
    const data = error.response.data;
    
    switch (status) {
      case 400:
        errorMessage = `Invalid request: ${data?.message || 'Bad request'}`;
        break;
      case 401:
        errorMessage = 'Unauthorized: Please login again';
        break;
      case 403:
        errorMessage = 'Forbidden: You do not have permission to perform this action';
        break;
      case 404:
        errorMessage = `Resource not found for this ${operation}`;
        break;
      case 409:
        errorMessage = 'Conflict: This operation conflicts with the current state';
        break;
      case 422:
        errorMessage = `Validation error: ${data?.message || 'Invalid data provided'}`;
        break;
      case 500:
        errorMessage = 'Server error: Please try again later';
        break;
      default:
        errorMessage = `Error (${status}): ${data?.message || 'Unknown error'}`;
    }
    
    throw new APIError(errorMessage, status, data);
  } else if (error.request) {
    // Request was made but no response received
    if (error.code === 'ECONNABORTED') {
      throw new APIError('Request timed out. Please try again later.', 408);
    }
    throw new APIError('Network error. Please check your connection.', 0);
  } else {
    // Something else happened while setting up the request
    throw new APIError(`Error setting up request: ${error.message}`, null);
  }
};

// Account API
export const accountAPI = {
  login: async (email, password) => {
    console.log('API Service: Attempting login for email:', email);
    try {
      console.log('API Service: Making login request to /Account/login');
      const response = await api.post('/Account/login', { email, password });
      console.log('API Service: Login successful, response data type:', typeof response.data);
      
      if (typeof response.data === 'object') {
        console.log('API Service: Login response object keys:', Object.keys(response.data));
      }
      
      return response.data;
    } catch (error) {
      console.error('API Service: Login failed with error:', error.message);
      console.error('API Service: Login error details:', error);
      
      // Special handling for login errors
      if (error.response && error.response.status === 400) {
        console.error('API Service: Bad request (400) during login:', error.response.data);
        throw new APIError('Invalid email or password', 400);
      }
      handleApiError(error, 'login');
    }
  },
  
  changePassword: async (passwordData) => {
    console.log('API Service: Attempting to change password');
    try {
      const response = await api.put('/Account/Password', passwordData);
      console.log('API Service: Password change successful');
      return response.data;
    } catch (error) {
      console.error('API Service: Password change failed:', error.message);
      handleApiError(error, 'password change');
    }
  }
};

// Jobs API
export const jobsAPI = {
  getAllJobs: async () => {
    try {
      const response = await api.get('/Jobs');
      return response.data;
    } catch (error) {
      handleApiError(error, 'retrieving jobs');
    }
  },
  
  createJob: async (jobData) => {
    try {
      const response = await api.post('/Jobs', jobData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'creating job');
    }
  },
  
  getJob: async (id) => {
    try {
      const response = await api.get(`/Jobs/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error, `retrieving job ${id}`);
    }
  },
  
  deleteJob: async (id) => {
    try {
      const response = await api.delete(`/Jobs/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error, `deleting job ${id}`);
    }
  },
  
  updateJob: async (jobId, jobData) => {
    try {
      const response = await api.put(`/Jobs/${jobId}`, jobData);
      return response.data;
    } catch (error) {
      handleApiError(error, `updating job ${jobId}`);
    }
  },
  
  addModelToJob: async (jobId, modelId) => {
    try {
      const response = await api.post(`/Jobs/${jobId}/model/${modelId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, `adding model ${modelId} to job ${jobId}`);
    }
  },
  
  removeModelFromJob: async (jobId, modelId) => {
    try {
      const response = await api.delete(`/Jobs/${jobId}/model/${modelId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, `removing model ${modelId} from job ${jobId}`);
    }
  }
};

// Managers API
export const managersAPI = {
  getAllManagers: async () => {
    try {
      const response = await api.get('/Managers');
      return response.data;
    } catch (error) {
      handleApiError(error, 'retrieving managers');
    }
  },
  
  createManager: async (managerData) => {
    try {
      const response = await api.post('/Managers', managerData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'creating manager');
    }
  },
  
  getManager: async (id) => {
    try {
      const response = await api.get(`/Managers/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error, `retrieving manager ${id}`);
    }
  },
  
  updateManager: async (id, managerData) => {
    try {
      const response = await api.put(`/Managers/${id}`, managerData);
      return response.data;
    } catch (error) {
      handleApiError(error, `updating manager ${id}`);
    }
  },
  
  deleteManager: async (id) => {
    try {
      const response = await api.delete(`/Managers/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error, `deleting manager ${id}`);
    }
  }
};

// Models API
export const modelsAPI = {
  getAllModels: async () => {
    try {
      const response = await api.get('/Models');
      return response.data;
    } catch (error) {
      handleApiError(error, 'retrieving models');
    }
  },
  
  createModel: async (modelData) => {
    try {
      const response = await api.post('/Models', modelData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'creating model');
    }
  },
  
  getModel: async (id) => {
    try {
      const response = await api.get(`/Models/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error, `retrieving model ${id}`);
    }
  },
  
  updateModel: async (id, modelData) => {
    try {
      const response = await api.put(`/Models/${id}`, modelData);
      return response.data;
    } catch (error) {
      handleApiError(error, `updating model ${id}`);
    }
  },
  
  deleteModel: async (id) => {
    try {
      const response = await api.delete(`/Models/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error, `deleting model ${id}`);
    }
  },
  
  getModelJobs: async (id) => {
    try {
      console.log(`API Service: Attempting to fetch jobs for model with ID: ${id}`);
      
      // Using the exact endpoint format from the API spec: /api/Models/{id}/jobs
      console.log(`API Service: Making GET request to /Models/${id}/jobs`);
      const response = await api.get(`/Models/${id}/jobs`);
      console.log('API Service: Successfully retrieved model jobs data');
      return response.data;
    } catch (error) {
      console.error(`API Service: Error fetching jobs for model ${id}:`, error.message);
      
      // Add specific handling for common errors
      if (error.response?.status === 404) {
        console.error('API Service: Model not found (404)');
        throw new APIError(`Model with ID ${id} not found`, 404);
      }
      if (error.response?.status === 401) {
        console.error('API Service: Unauthorized access to model jobs (401)');
        throw new APIError('You are not authorized to view these jobs', 401);
      }
      if (error.response?.status === 400) {
        console.error('API Service: Bad request (400):', error.response?.data);
        throw new APIError(`Invalid request parameters: ${error.response?.data?.message || 'Check model ID format'}`, 400);
      }
      
      handleApiError(error, `retrieving jobs for model ${id}`);
    }
  }
};

// Expenses API
export const expensesAPI = {
  // Manager-only endpoint
  getAllExpenses: async () => {
    try {
      const response = await api.get('/Expenses');
      return response.data;
    } catch (error) {
      handleApiError(error, 'retrieving expenses');
    }
  },
  
  // Model endpoint for creating a new expense
  createExpense: async (expenseData) => {
    try {
      const response = await api.post('/Expenses', expenseData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'creating expense');
    }
  },
  
  // Both model and manager can get a specific expense
  getExpense: async (id) => {
    try {
      const response = await api.get(`/Expenses/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error, `retrieving expense ${id}`);
    }
  },
  
  // Model endpoint for updating their expense
  updateExpense: async (id, expenseData) => {
    try {
      console.log(`API Service: Updating expense ${id} with data:`, expenseData);
      
      // Ensure we're using the right ID format
      const expenseId = expenseData.expenseId || id;
      
      // Make a copy of the data without the expenseId field to avoid duplication
      const { expenseId: _, ...updateData } = expenseData;
      
      const response = await api.put(`/Expenses/${expenseId}`, updateData);
      console.log(`API Service: Successfully updated expense ${expenseId}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`API Service: Error in updateExpense for ID ${id}:`, error);
      handleApiError(error, `updating expense ${id}`);
    }
  },
  
  // Model endpoint for deleting their expense
  deleteExpense: async (id) => {
    try {
      const response = await api.delete(`/Expenses/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error, `deleting expense ${id}`);
    }
  },
  
  // Both model and manager can get model expenses, but model can only get their own
  getModelExpenses: async (modelId) => {
    try {
      const response = await api.get(`/Expenses/model/${modelId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, `retrieving expenses for model ${modelId}`);
    }
  }
};

export default api;
