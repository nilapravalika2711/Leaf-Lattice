const API_ROOT = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export function getToken() { return localStorage.getItem('interior-admin-token') }
export function setSession(data) {
  localStorage.setItem('interior-admin-token', data.token)
  localStorage.setItem('interior-admin-user', JSON.stringify({ username: data.username, email: data.email }))
}
export function clearSession() {
  localStorage.removeItem('interior-admin-token')
  localStorage.removeItem('interior-admin-user')
}

export async function request(path, { method = 'GET', body, form = false } = {}) {
  const headers = {}
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (body && !form) headers['Content-Type'] = 'application/json'
  const response = await fetch(`${API_ROOT}${path}`, {
    method, headers, body: form ? body : body ? JSON.stringify(body) : undefined,
  })
  if (response.status === 401) {
    clearSession()
    if (window.location.pathname !== '/login') window.location.assign('/login')
  }
  if (response.status === 204) return null
  const payload = await response.json().catch(() => null)
  if (!response.ok) throw new Error(payload?.message || payload?.title || `Request failed (${response.status})`)
  return payload
}

export const authApi = {
  login: (identifier, password) => request('/auth/login', { method: 'POST', body: { identifier, password } }),
}
export const imagesApi = {
  list: () => request('/images'),
  create: (form) => request('/images', { method: 'POST', body: form, form: true }),
  update: (id, form) => request(`/images/${id}`, { method: 'PUT', body: form, form: true }),
  remove: (id) => request(`/images/${id}`, { method: 'DELETE' }),
}
export const materialsApi = {
  list: () => request('/materials'),
  create: (form) => request('/materials', { method: 'POST', body: form, form: true }),
  update: (id, form) => request(`/materials/${id}`, { method: 'PUT', body: form, form: true }),
  remove: (id) => request(`/materials/${id}`, { method: 'DELETE' }),
}
export const designsApi = {
  list: () => request('/designs'),
  create: (body) => request('/designs', { method: 'POST', body }),
  update: (id, body) => request(`/designs/${id}`, { method: 'PUT', body }),
  remove: (id) => request(`/designs/${id}`, { method: 'DELETE' }),
}
export const imageUrl = (path) => path ? `${API_ROOT.replace(/\/api$/, '')}${path}` : ''

