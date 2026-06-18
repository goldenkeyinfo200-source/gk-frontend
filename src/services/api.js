import axios from 'axios'

const API_URL =
  import.meta.env.VITE_API_URL || 'https://gk-network-production.up.railway.app'

const api = axios.create({
  baseURL: API_URL,
})

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('gk_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('gk_token')
      localStorage.removeItem('gk_agent')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

export const authApi = {
  login:           (data) => api.post('/api/auth/login', data),
  me:              ()     => api.get('/api/auth/me'),
  registerPublic:  (data) => api.post('/api/auth/register-public', data),

  // Parolni tiklash (Telegram bot orqali)
  forgotPassword:  (data) => api.post('/api/auth/forgot-password', data),
  verifyResetCode: (data) => api.post('/api/auth/verify-reset-code', data),
  resetPassword:   (data) => api.post('/api/auth/reset-password', data),
}

export const clientsApi = {
  list: (params) => api.get('/api/clients', { params }),
  get: (id) => api.get(`/api/clients/${id}`),
  create: (data) => api.post('/api/clients', data),
  update: (id, data) => api.put(`/api/clients/${id}`, data),
  delete: (id) => api.delete(`/api/clients/${id}`),
  matches: (id) => api.get(`/api/clients/${id}/matches`),
}

export const propertiesApi = {
  list: (params) => api.get('/api/properties', { params }),
  get: (id) => api.get(`/api/properties/${id}`),
  create: (data) => api.post('/api/properties', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => api.put(`/api/properties/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  matches: (id) => api.get(`/api/properties/${id}/matches`),
}

export const leadsApi = {
  list: (params) => api.get('/api/leads', { params }),
  send: (data) => api.post('/api/leads', data),
  respond: (id, action) => api.put(`/api/leads/${id}/respond`, { action }),
}