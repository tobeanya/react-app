import axios, { AxiosInstance, AxiosError } from 'axios';

// API base URL - change this when deploying
// Backend runs on https://localhost:7087 (or http://localhost:5143)
const API_BASE_URL = 'https://localhost:7087/api';

// Create axios instance with default config
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor for logging and auth (if needed later)
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token here if implementing authentication
    // const token = await getToken();
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with error status
      console.error(`[API] Error ${error.response.status}:`, error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('[API] No response received:', error.message);
    } else {
      // Error setting up request
      console.error('[API] Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Helper function to update base URL at runtime
export const setApiBaseUrl = (url: string) => {
  apiClient.defaults.baseURL = url;
};

export default apiClient;
