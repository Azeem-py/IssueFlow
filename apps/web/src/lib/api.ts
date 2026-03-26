import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  withCredentials: true, // Crucial for sending/receiving HttpOnly cookies
});

// Request interceptor to automatically inject Organization ID
api.interceptors.request.use(
  (config) => {
    // Try to get orgId from localStorage
    const orgId = localStorage.getItem('issueflow_org_id');
    
    // Only inject if it exists and wasn't manually provided
    if (orgId && !config.headers['x-org-id']) {
      config.headers['x-org-id'] = orgId;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Response interceptor to handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying and not a refresh request
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh') {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post('/auth/refresh');
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(error, null); // Pass original 401 error

        // If refresh fails, we should logout the user locally and redirect to login
        // but only if we are currently on a protected route that requires auth.
        const publicPaths = ['/', '/login', '/signup', '/forgot-password', '/invite/accept'];
        const isPublicPath = publicPaths.includes(window.location.pathname);
        
        if (typeof window !== 'undefined' && !isPublicPath) {
          window.location.href = '/login';
        }

        return Promise.reject(error); // Reject with original error
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
