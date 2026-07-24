import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || '';
const cleanBaseUrl = rawApiUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');

const api = axios.create({
  baseURL: cleanBaseUrl,
  withCredentials: true,
});

// Response interceptor to handle expired access tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data.code === 'TOKEN_EXPIRED' &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        await axios.post(
          `${cleanBaseUrl}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('userInfo');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;