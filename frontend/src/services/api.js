import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Crear instancia de axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token de autorización
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const refreshToken = Cookies.get('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          Cookies.set('access_token', access, { expires: 1 });

          original.headers.Authorization = `Bearer ${access}`;
          return apiClient(original);
        }
      } catch (refreshError) {
        // Token refresh failed, redirect to login
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// API methods
export const api = {
  // Health check
  healthCheck: () => apiClient.get('/health/'),

  // Authentication
  login: (credentials) => apiClient.post('/auth/login/', credentials),
  requestPasswordReset: (data) => apiClient.post('/auth/password-reset-request/', data),
  resetPassword: (data) => apiClient.post('/auth/password-reset-confirm/', data),

  // Organizations
  getOrganizations: () => apiClient.get('/organizations/'),
  createOrganization: (data) => apiClient.post('/organizations/', data),
  getOrganization: (id) => apiClient.get(`/organizations/${id}/`),
  updateOrganization: (id, data) => apiClient.put(`/organizations/${id}/`, data),
  deleteOrganization: (id) => apiClient.delete(`/organizations/${id}/`),

  // Generic CRUD operations
  get: (endpoint) => apiClient.get(endpoint),
  post: (endpoint, data) => apiClient.post(endpoint, data),
  put: (endpoint, data) => apiClient.put(endpoint, data),
  patch: (endpoint, data) => apiClient.patch(endpoint, data),
  delete: (endpoint) => apiClient.delete(endpoint),
};

export default apiClient;