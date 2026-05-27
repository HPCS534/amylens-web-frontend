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

  getAnalytics: () => request('/api/analytics'),
  exportSessions: ({ format = 'csv', variety, status, dateFrom, dateTo } = {}) => {
    // DEV fallback: return hardcoded blobs when running locally without a backend
    if (import.meta.env.DEV) {
      const sampleRows = [
        ['sessionId', 'deviceSsaid', 'userName', 'variety', 'amyloseClass', 'confidenceScore', 'capturedAt', 'submittedAt', 'trialStage', 'season', 'imageHash', 'grainLength', 'grainShape', 'percentAcceptability'],
        ['SESS-001', '550e8400-e29b-41d4-a716-446655440000', 'Alice', 'IR64', 'Waxy', '0.92', '2024-10-01T09:12:00Z', '2024-10-01T09:13:00Z', 'Field', '2024', 'hash1', '6.2', 'Long', '98.5'],
        ['SESS-002', '76c45922-a11c-9a3d-a223-228833119999', 'Bob', 'Samba', 'Low', '0.78', '2024-10-02T11:05:00Z', '2024-10-02T11:06:00Z', 'Lab', '2024', 'hash2', '5.9', 'Round', '92.1'],
      ]

      if (format === 'json') {
        const json = JSON.stringify([
          { sessionId: 'SESS-001', deviceSsaid: '550e8...', userName: 'Alice', variety: 'IR64', amyloseClass: 'Waxy', confidenceScore: 0.92, capturedAt: '2024-10-01T09:12:00Z' },
          { sessionId: 'SESS-002', deviceSsaid: '76c45...', userName: 'Bob', variety: 'Samba', amyloseClass: 'Low', confidenceScore: 0.78, capturedAt: '2024-10-02T11:05:00Z' },
        ], null, 2)
        return Promise.resolve(new Blob([json], { type: 'application/json' }))
      }

      // For CSV/PDF fallback: return CSV content; PDF will be a text blob (for simple testing)
      const csv = sampleRows.map((r) => r.map((c) => String(c).replace(/"/g, '""')).map((c) => `"${c}"
      `.trim()).join(',')).join('\n')
      if (format === 'pdf') {
        // Not a real PDF generator; return a basic PDF-like blob placeholder for testing download
        const pdfContent = '%PDF-1.4\n%âãÏÓ\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n'
        return Promise.resolve(new Blob([pdfContent], { type: 'application/pdf' }))
      }
      return Promise.resolve(new Blob([csv], { type: 'text/csv' }))
    }

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
