// Lightweight API client for interacting with Module 3 backend
const base = import.meta.env.DEV ? '' : import.meta.env.VITE_API_URL ?? ''

function buildUrl(path) {
  if (!path.startsWith('/')) path = '/' + path
  return base ? `${base}${path}` : path
}

async function request(path, options = {}) {
  const url = buildUrl(path)
  const opts = { credentials: 'include', ...options }

  // JSON body helper
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
  // Backend uses form login at /api/auth/login (Spring Security)
  const body = new URLSearchParams({ username, password })
  const res = await fetch(buildUrl('/api/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Login failed: ' + res.status)
  return res
}

export const api = {
  // Public endpoints
  getVarieties: () => request('/api/varieties'),
  submitSession: (dto) => request('/api/sessions', { method: 'POST', body: dto }),
  deviceAuth: (ssaid) => request('/api/devices/auth', { method: 'POST', body: { ssaid } }),
  getDeviceUsers: (ssaid) => request(`/api/devices/${encodeURIComponent(ssaid)}/users`),
  resetPassword: (currentPassword, newPassword) =>
    request('/api/auth/reset', { method: 'POST', body: { currentPassword, newPassword } }),

  // Authenticated/dashboard endpoints (require login via `login()`)
  getSessions: ({ variety, status } = {}) => {
    const params = new URLSearchParams()
    if (variety) params.set('variety', variety)
    if (status) params.set('status', status)
    const qs = params.toString()
    return request(`/api/sessions${qs ? `?${qs}` : ''}`)
  },

  reviewSession: (id, { action, reviewerNote, reviewerIdentity } = {}) =>
      request(`/api/sessions/${id}/review`, { method: 'POST', body: { action, reviewerNote, reviewerIdentity } }),

  getAnalytics: () => request('/api/analytics'),
  exportSessions: ({ format = 'csv', variety, status } = {}) => {
    const params = new URLSearchParams({ format })
    if (variety) params.set('variety', variety)
    if (status) params.set('status', status)
    return requestBlob(`/api/sessions/export?${params.toString()}`)
  },

  // Admin/device management (require authenticated session)
  getAllDevices: () => request('/api/devices'),
  approveDevice: (id, userNames) => request(`/api/devices/${id}/approve`, { method: 'PUT', body: userNames }),
  denyDevice: (id) => request(`/api/devices/${id}/deny`, { method: 'PUT' }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
}

export default request
