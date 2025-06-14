// Generic API client configuration
const API_BASE_URL = 'http://localhost:3000';

// Generic request options interface
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string>;
}

// Generic API error class
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Build URL with query parameters
function buildUrl(endpoint: string, params?: Record<string, string>): string {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }
  
  return url.toString();
}

// Generic request function
async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    body,
    params
  } = options;

  const url = buildUrl(endpoint, params);
  
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new ApiError(
        response.status,
        response.statusText,
        `HTTP error! status: ${response.status}`
      );
    }

    // Handle empty responses (like DELETE requests)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return {} as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    console.error('API request error:', error);
    throw new Error('Network error or server unavailable');
  }
}

// Exported API client methods
export const apiClient = {
  // GET request
  get: <T>(endpoint: string, params?: Record<string, string>): Promise<T> => {
    return request<T>(endpoint, { method: 'GET', params });
  },

  // POST request
  post: <T>(endpoint: string, data: any): Promise<T> => {
    return request<T>(endpoint, { method: 'POST', body: data });
  },

  // PUT request
  put: <T>(endpoint: string, data: any): Promise<T> => {
    return request<T>(endpoint, { method: 'PUT', body: data });
  },

  // PATCH request
  patch: <T>(endpoint: string, data: any): Promise<T> => {
    return request<T>(endpoint, { method: 'PATCH', body: data });
  },

  // DELETE request
  delete: <T>(endpoint: string): Promise<T> => {
    return request<T>(endpoint, { method: 'DELETE' });
  },
};

export default apiClient; 