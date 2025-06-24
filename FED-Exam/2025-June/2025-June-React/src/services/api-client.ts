// Base URL for the API server
// This allows for easy configuration and environment-specific deployments
const API_BASE_URL = 'http://localhost:3000';

// Interface defining the structure of request configuration options
// This provides type safety and clear documentation of available options
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';  // HTTP method to use
  headers?: Record<string, string>;                      // Additional headers to send
  body?: any;                                            // Request body data
  params?: Record<string, string>;                       // URL query parameters
}

// Custom error class for API-related errors
// This provides structured error information for better error handling
export class ApiError extends Error {
  constructor(
    public status: number,        // HTTP status code (e.g., 404, 500)
    public statusText: string,    // HTTP status text (e.g., "Not Found")
    message: string               // Detailed error message
  ) {
    // Call parent Error constructor with the message
    super(message);
    
    // Set the error name for better debugging
    this.name = 'ApiError';
  }
}

// Utility function to build complete URLs with query parameters
// This handles the complexity of URL construction and parameter encoding
function buildUrl(endpoint: string, params?: Record<string, string>): string {
  // Start with the base URL and endpoint
  const url = new URL(endpoint, API_BASE_URL);
  
  // If parameters are provided, add them to the URL
  if (params) {
    // Iterate through each parameter
    Object.entries(params).forEach(([key, value]) => {
      // Add parameter to URL (automatically handles encoding)
      url.searchParams.append(key, value);
    });
  }
  
  // Return the complete URL as string
  return url.toString();
}

// Generic function to make HTTP requests with consistent error handling
// This provides a unified interface for all API communication
async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  // Destructure options with default values
  const { 
    method = 'GET',           // Default to GET requests
    headers = {},             // Default to no extra headers
    body,                     // Request body (optional)
    params                    // Query parameters (optional)
  } = options;

  try {
    // Build the complete URL with any query parameters
    const url = buildUrl(endpoint, params);

    // Prepare fetch configuration object
    const config: RequestInit = {
      method,                 // HTTP method
      headers: {
        // Set JSON content type for requests with body
        'Content-Type': 'application/json',
        ...headers            // Spread any additional headers
      },
    };

    // Add body to config if provided (and not GET request)
    if (body && method !== 'GET') {
      // Serialize body to JSON string
      config.body = JSON.stringify(body);
    }

    // Make the actual HTTP request
    const response = await fetch(url, config);

    // Check if the response indicates an error
    if (!response.ok) {
      // Throw custom error with detailed information
      throw new ApiError(
        response.status,          // HTTP status code
        response.statusText,      // HTTP status text
        `HTTP error! status: ${response.status}` // Descriptive message
      );
    }

    // Check if response has JSON content
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      // Parse and return JSON response
      return await response.json();
    }
    
    // Return empty object for non-JSON responses
    // This maintains type consistency
    return {} as T;

  } catch (error) {
    // Check if error is already our custom ApiError
    if (error instanceof ApiError) {
      // Re-throw API errors as-is
      throw error;
    }
    
    // Log unexpected errors for debugging
    console.error('API request error:', error);
    
    // Throw generic error for network issues, etc.
    throw new Error('Network error or server unavailable');
  }
}

// Export object containing HTTP method convenience functions
// This provides a clean, consistent API for making different types of requests
export const apiClient = {
  // GET request - retrieve data
  get: <T>(endpoint: string, params?: Record<string, string>): Promise<T> => {
    return request<T>(endpoint, { method: 'GET', params });
  },

  // POST request - create new data
  post: <T>(endpoint: string, data: any): Promise<T> => {
    return request<T>(endpoint, { method: 'POST', body: data });
  },

  // PUT request - update/replace existing data
  put: <T>(endpoint: string, data: any): Promise<T> => {
    return request<T>(endpoint, { method: 'PUT', body: data });
  },

  // PATCH request - partially update existing data
  patch: <T>(endpoint: string, data: any): Promise<T> => {
    return request<T>(endpoint, { method: 'PATCH', body: data });
  },

  // DELETE request - remove data
  delete: <T>(endpoint: string): Promise<T> => {
    return request<T>(endpoint, { method: 'DELETE' });
  },
};

export default apiClient; 