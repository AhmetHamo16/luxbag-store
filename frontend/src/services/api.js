import axios from 'axios';

const defaultApiBase =
  typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? 'http://127.0.0.1:5000/api'
    : 'https://luxbag-store-production.up.railway.app/api';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultApiBase,
  withCredentials: true, // IMPORTANT for sending cookies (refreshToken)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Access Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 & Auto-Refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Skip refresh for these public routes — never retry them
    const skipRefreshUrls = [
      '/auth/login',
      '/auth/refresh-token'
    ];

    const shouldSkip = skipRefreshUrls.some(url => 
      originalRequest.url?.includes(url)
    );

    if (error.response?.status === 401 && !originalRequest._retry && !shouldSkip) {
      originalRequest._retry = true;
      try {
        // Assume /api/auth/refresh-token uses the httpOnly cookie to get a new access token
        const { data } = await axios.post(`${import.meta.env.VITE_API_URL || defaultApiBase}/auth/refresh-token`, {}, { withCredentials: true });
        
        localStorage.setItem('accessToken', data.accessToken);
        
        // Update header and retry
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed (e.g., cookie expired), force logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('auth-storage');
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
