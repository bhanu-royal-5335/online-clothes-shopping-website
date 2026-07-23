import axios from 'axios';

const api = axios.create({
  baseURL: '', // Handled by Vite proxy in development
  withCredentials: true, // Send HTTP-Only cookies with every request
});

// Response interceptor to handle expired access tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and not already retried
    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data.code === 'TOKEN_EXPIRED' &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Attempt to call the refresh endpoint to obtain a new cookie
        await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        
        // Retry the original request with the fresh token cookie active
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Refresh token expired or invalid, forcing logout');
        // Clear local storage and redirect if refresh fails
        localStorage.removeItem('userInfo');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
