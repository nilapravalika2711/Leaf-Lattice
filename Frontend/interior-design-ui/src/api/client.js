const API_ROOT = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// --- Admin Session ---
export function getAdminToken() { return localStorage.getItem('interior-admin-token') }
export function getToken() { return getAdminToken() } // backwards-compatibility
export function setAdminSession(data) {
  localStorage.setItem('interior-admin-token', data.token)
  localStorage.setItem('interior-admin-user', JSON.stringify({ username: data.username, email: data.email }))
}
export function setSession(data) { setAdminSession(data) } // backwards-compatibility
export function clearAdminSession() {
  localStorage.removeItem('interior-admin-token')
  localStorage.removeItem('interior-admin-user')
}
export function clearSession() { clearAdminSession() } // backwards-compatibility

// --- Customer Session ---
export function getCustomerToken() { return localStorage.getItem('interior-customer-token') }
export function getCustomerUser() {
  try { return JSON.parse(localStorage.getItem('interior-customer-user') || '{}') } catch { return {} }
}
export function setCustomerSession(data) {
  localStorage.setItem('interior-customer-token', data.token)
  localStorage.setItem('interior-customer-user', JSON.stringify({ fullName: data.fullName || data.username || 'Client', email: data.email }))
}
export function clearCustomerSession() {
  localStorage.removeItem('interior-customer-token')
  localStorage.removeItem('interior-customer-user')
}

// --- Request helper ---
export async function request(path, { method = 'GET', body, form = false, auth } = {}) {
  const headers = {}
  let token = null
  if (auth === 'customer' || path.startsWith('/customer')) {
    token = getCustomerToken()
  } else if (auth === 'admin' || path.startsWith('/images') || path.startsWith('/materials') || path.startsWith('/designs')) {
    token = getAdminToken()
  } else {
    token = getAdminToken() || getCustomerToken()
  }

  if (token) headers.Authorization = `Bearer ${token}`
  if (body && !form) headers['Content-Type'] = 'application/json'

  const response = await fetch(`${API_ROOT}${path}`, {
    method,
    headers,
    body: form ? body : body ? JSON.stringify(body) : undefined,
  })

  if (response.status === 401) {
    if (auth === 'customer' || path.startsWith('/customer')) {
      clearCustomerSession()
    } else {
      clearAdminSession()
    }
    if (window.location.pathname !== '/') window.location.assign('/')
  }

  if (response.status === 204) return null
  const payload = await response.json().catch(() => null)
  if (!response.ok) throw new Error(payload?.message || payload?.title || `Request failed (${response.status})`)
  return payload
}

export const authApi = {
  adminLogin: (identifier, password) => request('/auth/admin/login', { method: 'POST', body: { identifier, password } }),
  login: (identifier, password) => request('/auth/login', { method: 'POST', body: { identifier, password } }),
  customerLogin: (email, password) => request('/auth/customer/login', { method: 'POST', body: { email, password } }),
  customerRegister: ({ fullName, email, password }) => request('/auth/customer/register', { method: 'POST', body: { fullName, email, password } }),
}

export const imagesApi = {
  list: () => request('/images', { auth: 'admin' }),
  create: (form) => request('/images', { method: 'POST', body: form, form: true, auth: 'admin' }),
  update: (id, form) => request(`/images/${id}`, { method: 'PUT', body: form, form: true, auth: 'admin' }),
  remove: (id) => request(`/images/${id}`, { method: 'DELETE', auth: 'admin' }),
}

export const materialsApi = {
  list: () => request('/materials', { auth: 'admin' }),
  create: (form) => request('/materials', { method: 'POST', body: form, form: true, auth: 'admin' }),
  update: (id, form) => request(`/materials/${id}`, { method: 'PUT', body: form, form: true, auth: 'admin' }),
  remove: (id) => request(`/materials/${id}`, { method: 'DELETE', auth: 'admin' }),
}

export const designsApi = {
  list: () => request('/designs', { auth: 'admin' }),
  create: (body) => request('/designs', { method: 'POST', body, auth: 'admin' }),
  update: (id, body) => request(`/designs/${id}`, { method: 'PUT', body, auth: 'admin' }),
  remove: (id) => request(`/designs/${id}`, { method: 'DELETE', auth: 'admin' }),
}

export const customerDesignsApi = {
  list: () => request('/customer/designs', { auth: 'customer' }),
  get: (id) => request(`/customer/designs/${id}`, { auth: 'customer' }),
}

export const imageUrl = (path) => path ? `${API_ROOT.replace(/\/api$/, '')}${path}` : ''
