// Lightweight API client for interacting with Module 3 backend
// Prefer an explicit VITE_API_URL when present (even in dev) so the client can
// call the backend over HTTPS and receive Secure cookies from the deployed
// backend. Otherwise fall back to relative paths in dev (Vite proxy).
const base = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? '' : '')

function buildUrl(path) {
  if (!path.startsWith('/')) path = '/' + path
  return base ? `${base}${path}` : path
}

async function request(path, options = {}) {
  const url = buildUrl(path)
  const opts = { credentials: 'include', ...options }

  if (opts.body && typeof opts.body === 'object' && !(opts.body instanceof FormData)) {
    opts.headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) }
    opts.body = JSON.stringify(opts.body)
  }

  const res = await fetch(url, opts)
  const contentType = res.headers.get('content-type') || ''

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    const err = new Error(res.statusText || String(res.status))
    err.status = res.status
    err.body = text
    throw err
  }

  if (contentType.includes('application/json')) return res.json()
  return res.text()
}

async function requestBlob(path, options = {}) {
  const url = buildUrl(path)
  const opts = { credentials: 'include', ...options }

  if (opts.body && typeof opts.body === 'object' && !(opts.body instanceof FormData)) {
    opts.headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) }
    opts.body = JSON.stringify(opts.body)
  }

  const res = await fetch(url, opts)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    const err = new Error(res.statusText || String(res.status))
    err.status = res.status
    err.body = text
    throw err
  }

  return res.blob()
}

export async function login(username, password) {
  return request('/api/auth/login', { method: 'POST', body: { username, password } })
}

export async function register(username, password) {
  return request('/api/auth/register', { method: 'POST', body: { username, password } })
}

export async function importGqrisMirror(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request('/api/admin/gqris/import', { method: 'POST', body: formData })
}

export const api = {
  // Public endpoints
  getVarieties: () => request('/api/varieties'),
  submitSession: (dto) => request('/api/sessions', { method: 'POST', body: dto }),
  deviceAuth: (ssaid) => request('/api/devices/auth', { method: 'POST', body: { ssaid } }),
  getDeviceUsers: (ssaid) => request(`/api/devices/${encodeURIComponent(ssaid)}/users`),
  resetPassword: (currentPassword, newPassword) =>
      request('/api/auth/reset', { method: 'POST', body: { currentPassword, newPassword } }),

  // Authenticated/dashboard endpoints
  getSessions: ({ variety, status, dateFrom, dateTo } = {}) => {
    const params = new URLSearchParams()
    if (variety) params.set('variety', variety)
    if (status) params.set('status', status)
    if (dateFrom) params.set('dateFrom', dateFrom)
    if (dateTo) params.set('dateTo', dateTo)
    const qs = params.toString()
    return request(`/api/sessions${qs ? `?${qs}` : ''}`)
  },

  reviewSession: (id, { action, reviewerNote, reviewerIdentity } = {}) =>
      request(`/api/sessions/${id}/review`, { method: 'POST', body: { action, reviewerNote, reviewerIdentity } }),

  exportSessions: ({ format = 'csv', variety, status, dateFrom, dateTo } = {}) => {
    const params = new URLSearchParams({ format })
    if (variety) params.set('variety', variety)
    if (status) params.set('status', status)
    if (dateFrom) params.set('dateFrom', dateFrom)
    if (dateTo) params.set('dateTo', dateTo)
    return requestBlob(`/api/sessions/export?${params.toString()}`)
  },

  // Admin/device management
  getAllDevices: () => request('/api/devices'),
  approveDevice: (id, userNames) => request(`/api/devices/${id}/approve`, { method: 'PUT', body: userNames }),
  denyDevice: (id) => request(`/api/devices/${id}/deny`, { method: 'PUT' }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  importGqrisMirror,
}

export default request