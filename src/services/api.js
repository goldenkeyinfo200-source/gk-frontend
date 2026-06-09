import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

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

// ─── Auth ───────────────────────────────────────────────
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  me:    ()     => api.get('/auth/me'),
  registerPublic: (data) => api.post('/auth/register-public', data),
}

// ─── Clients ────────────────────────────────────────────
export const clientsApi = {
  list:    (params) => api.get('/clients', { params }),
  get:     (id)     => api.get(`/clients/${id}`),
  create:  (data)   => api.post('/clients', data),
  update:  (id, data) => api.put(`/clients/${id}`, data),
  delete:  (id)     => api.delete(`/clients/${id}`),
  matches: (id)     => api.get(`/clients/${id}/matches`),
}

// ─── Properties ─────────────────────────────────────────
export const propertiesApi = {
  list:    (params) => api.get('/properties', { params }),
  get:     (id)     => api.get(`/properties/${id}`),
  create:  (data)   => api.post('/properties', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update:  (id, data) => api.put(`/properties/${id}`, data),
  matches: (id)     => api.get(`/properties/${id}/matches`),
}

// ─── Leads ──────────────────────────────────────────────
export const leadsApi = {
  list:    (params) => api.get('/leads', { params }),
  send:    (data)   => api.post('/leads', data),
  respond: (id, action) => api.put(`/leads/${id}/respond`, { action }),
}
