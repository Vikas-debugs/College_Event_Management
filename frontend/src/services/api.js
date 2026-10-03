import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tihs_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('tihs_refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post('/api/auth/refresh', { refreshToken });
          if (res.data.success) {
            localStorage.setItem('tihs_token', res.data.accessToken);
            localStorage.setItem('tihs_refresh_token', res.data.refreshToken);
            originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
            return api(originalRequest);
          }
        } catch (refreshErr) {
          localStorage.removeItem('tihs_token');
          localStorage.removeItem('tihs_refresh_token');
          localStorage.removeItem('tihs_user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  verifyEmail: (data) => api.post('/auth/verify-email', data),
  resendOtp: (data) => api.post('/auth/resend-otp', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfilePhoto: (data) => api.put('/auth/profile-photo', data),
  updateProfile: (data) => api.put('/auth/profile', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data),
};

// Events Endpoints
export const eventApi = {
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) =>
    data instanceof FormData
      ? api.post('/events', data, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.post('/events', data),
  update: (id, data) =>
    data instanceof FormData
      ? api.put(`/events/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  approve: (id) => api.patch(`/events/${id}/approve`),
  reject: (id, reason) => api.patch(`/events/${id}/reject`, { reason }),
  bulkImport: (events) => api.post('/events/bulk-import', { events }),
};

// Registrations Endpoints
export const registrationApi = {
  register: (eventId, data) => api.post(`/events/${eventId}/register`, data),
  getMyRegistrations: () => api.get('/registrations/me'),
  cancel: (id, reason) => api.delete(`/registrations/${id}`, { data: { reason } }),
  getByEvent: (eventId) => api.get(`/registrations/event/${eventId}`),
};

// Payments Endpoints
export const paymentApi = {
  createOrder: (data) => api.post('/payments/create-order', data),
  verify: (data) => api.post('/payments/verify', data),
};

// Attendance Endpoints
export const attendanceApi = {
  scan: (data) => api.post('/attendance/scan', data),
  getByEvent: (eventId) => api.get(`/attendance/event/${eventId}`),
  verifyPublic: (data) => api.post('/attendance/verify-public', data),
};

// Certificates Endpoints
export const certificateApi = {
  getMyCertificates: () => api.get('/certificates/me'),
  getById: (id) => api.get(`/certificates/${id}`),
  bulkGenerate: (eventId) => api.post(`/certificates/bulk-generate/${eventId}`),
};

// Feedback Endpoints
export const feedbackApi = {
  submit: (data) => api.post('/feedback', data),
  getByEvent: (eventId) => api.get(`/feedback/event/${eventId}`),
};

// Admin Endpoints
export const adminApi = {
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  updateRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  toggleBlock: (id) => api.patch(`/admin/users/${id}/toggle-block`),
  getAuditLogs: () => api.get('/admin/audit-logs'),
  getAnalytics: () => api.get('/admin/analytics'),
};


export default api;
