import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Crear instancia de axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Permite enviar cookies
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

  // User
  getCurrentUser: () => apiClient.get('/user/me/'),
  updateProfile: (data) => apiClient.patch('/user/me/', data),
  changePassword: (data) => apiClient.post('/user/change-password/', data),
  uploadAvatar: (formData) => apiClient.post('/user/avatar/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteAvatar: () => apiClient.delete('/user/avatar/delete/'),

  // Organizations
  getOrganizations: () => apiClient.get('/organizations/'),
  createOrganization: (data) => apiClient.post('/organizations/', data),
  getOrganization: (id) => apiClient.get(`/organizations/${id}/`),
  updateOrganization: (id, data) => apiClient.put(`/organizations/${id}/`, data),
  deleteOrganization: (id) => apiClient.delete(`/organizations/${id}/`),

  // ESG Data
  getESGDataCollection: () => apiClient.get('/esg/data-collection/'),
  getESGMetrics: () => apiClient.get('/esg/metrics/'),
  getESGScopes: () => apiClient.get('/esg/scopes/'),
  getESGPeriods: () => apiClient.get('/esg/periods/'),
  getESGGoals: () => apiClient.get('/esg/goals/'),
  getESGActions: () => apiClient.get('/esg/actions/'),

  // SustentIA
  getSustentIAInsight: (force = false) => apiClient.get(`/sustentia/insight/${force ? '?force=true' : ''}`),

  // Compliance - Cumplimiento Normativo
  getComplianceFrameworks: () => apiClient.get('/compliance/frameworks/'),
  getComplianceFramework: (id) => apiClient.get(`/compliance/frameworks/${id}/`),
  getFrameworkRequirements: (id) => apiClient.get(`/compliance/frameworks/${id}/requirements/`),
  
  getComplianceDocuments: () => apiClient.get('/compliance/documents/'),
  uploadComplianceDocument: (formData) => apiClient.post('/compliance/documents/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteComplianceDocument: (id) => apiClient.delete(`/compliance/documents/${id}/`),
  extractDocumentText: (id) => apiClient.post(`/compliance/documents/${id}/extract_text/`),
  
  getComplianceAnalyses: () => apiClient.get('/compliance/analyses/'),
  getComplianceAnalysis: (id) => apiClient.get(`/compliance/analyses/${id}/`),
  createComplianceAnalysis: (data) => apiClient.post('/compliance/analyses/', data),
  runComplianceAnalysis: (id) => apiClient.post(`/compliance/analyses/${id}/run/`),
  getComplianceDashboard: () => apiClient.get('/compliance/analyses/dashboard/'),
  
  getComplianceGaps: (analysisId) => {
    const params = analysisId ? `?analysis=${analysisId}` : '';
    return apiClient.get(`/compliance/gaps/${params}`);
  },
  updateComplianceGap: (id, data) => apiClient.patch(`/compliance/gaps/${id}/`, data),
  assignGap: (id, data) => apiClient.post(`/compliance/gaps/${id}/assign/`, data),
  resolveGap: (id, data) => apiClient.post(`/compliance/gaps/${id}/resolve/`, data),
  
  getComplianceReports: () => apiClient.get('/compliance/reports/'),
  createComplianceReport: (data) => apiClient.post('/compliance/reports/', data),
  generateComplianceReport: (id) => apiClient.post(`/compliance/reports/${id}/generate/`),

  // Generic CRUD operations
  get: (endpoint) => apiClient.get(endpoint),
  post: (endpoint, data) => apiClient.post(endpoint, data),
  put: (endpoint, data) => apiClient.put(endpoint, data),
  patch: (endpoint, data) => apiClient.patch(endpoint, data),
  delete: (endpoint) => apiClient.delete(endpoint),
};

export default apiClient;