// Lightweight API client for interacting with the Module 4 backend surface
// In development, default to the locally-running backend so the UI can call APIs across origins.
const base = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:8080' : '')

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
  // Backend uses Spring Security form login at /api/auth/login.
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
  resetPassword: (currentPassword, newPassword) =>
    request('/api/auth/reset', { method: 'POST', body: { currentPassword, newPassword } }),

  importGqrisMirror: (file) => {
    const formData = new FormData()
    formData.append('file', file, file.name)
    return request('/api/admin/gqris/import', {
      method: 'POST',
      body: formData,
    })
  },

  // Authenticated/dashboard endpoints (require login via `login()`)
  getSessions: ({ variety, status, dateFrom, dateTo } = {}) => {
    const params = new URLSearchParams()
    if (variety) params.set('variety', variety)
    if (status) params.set('status', status)
    if (dateFrom) params.set('dateFrom', dateFrom)
    if (dateTo) params.set('dateTo', dateTo)
    const qs = params.toString()
    return request(`/api/sessions${qs ? `?${qs}` : ''}`)
  },

  reviewSession: (id, { action, reviewerNote, reviewerIdentity, reviewTimestamp } = {}) =>
    request(`/api/sessions/${id}/review`, {
      method: 'POST',
      body: {
        action,
        reviewerNote,
        reviewerIdentity,
        reviewTimestamp: reviewTimestamp ?? new Date().toISOString(),
      },
    }),

  getAnalytics: () => request('/api/analytics'),
  exportSessions: ({ format = 'csv', variety, status, dateFrom, dateTo } = {}) => {
    const params = new URLSearchParams({ format })
    if (variety) params.set('variety', variety)
    if (status) params.set('status', status)
    if (dateFrom) params.set('dateFrom', dateFrom)
    if (dateTo) params.set('dateTo', dateTo)
    return requestBlob(`/api/sessions/export?${params.toString()}`)
  },

  // Admin/device management (require authenticated session)
  getAllDevices: () => request('/api/devices'),
  approveDevice: (id, userNames) => request(`/api/devices/${id}/approve`, { method: 'PUT', body: userNames }),
  denyDevice: (id) => request(`/api/devices/${id}/deny`, { method: 'PUT' }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
}

export default request
