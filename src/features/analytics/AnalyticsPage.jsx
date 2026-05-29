import { useEffect, useMemo, useState } from 'react'
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { api } from '../../api/client'

const AMYLOSE_CLASSES = ['Waxy', 'Low', 'Intermediate', 'High']

// Build a trend dataset from raw sessions grouped by month
function buildTrend(sessions) {
  const byMonth = {}
  for (const s of sessions) {
    const date = new Date(s.capturedAt ?? s.submittedAt ?? null)
    if (isNaN(date)) continue
    const label = date.toLocaleString('en-US', { month: 'short', year: '2-digit' })
    if (!byMonth[label]) byMonth[label] = { label, Waxy: 0, Low: 0, Intermediate: 0, High: 0 }
    const cls = s.amyloseClass
    if (AMYLOSE_CLASSES.includes(cls)) byMonth[label][cls]++
  }
  return Object.values(byMonth).slice(-6) // last 6 months
}

// Build consistency data: mean amylose ordinal per year for the selected variety
const ORDINAL = { Waxy: 1, Low: 2, Intermediate: 3, High: 4 }
function buildConsistency(sessions, variety) {
  const byYear = {}
  for (const s of sessions) {
    if (variety !== 'all' && s.variety !== variety) continue
    if (s.verdict !== 'verified') continue
    const date = new Date(s.capturedAt ?? s.submittedAt ?? null)
    if (isNaN(date)) continue
    const year = String(date.getFullYear())
    if (!byYear[year]) byYear[year] = { label: year, sum: 0, count: 0 }
    byYear[year].sum += ORDINAL[s.amyloseClass] ?? 0
    byYear[year].count++
  }
  return Object.values(byYear)
      .sort((a, b) => a.label.localeCompare(b.label))
      .map((e) => ({ label: e.label, current: e.count ? +(e.sum / e.count).toFixed(2) : 0 }))
}

export default function AnalyticsPage() {
  const [sessions, setSessions] = useState([])
  const [varieties, setVarieties] = useState([])
  const [selectedVariety, setSelectedVariety] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([api.getSessions(), api.getVarieties()])
        .then(([sessionPayload, varietyPayload]) => {
          if (!active) return
          setError('')
          const raw = Array.isArray(sessionPayload) ? sessionPayload
              : Array.isArray(sessionPayload?.content) ? sessionPayload.content : []
          setSessions(raw)
          const vars = Array.isArray(varietyPayload) ? varietyPayload
              : Array.isArray(varietyPayload?.content) ? varietyPayload.content : []
          setVarieties(vars)
        })
        .catch((err) => {
          if (!active) return
          setSessions([])
          setVarieties([])
          if (err?.status === 401 || err?.status === 403) {
            setError('You are not authenticated. Please sign in to view analytics.')
          } else {
            setError('Failed to load analytics data from backend.')
          }
        })
        .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const filteredSessions = useMemo(() =>
          selectedVariety === 'all' ? sessions : sessions.filter((s) => s.variety === selectedVariety),
      [sessions, selectedVariety]
  )

  const trend = useMemo(() => buildTrend(filteredSessions), [filteredSessions])
  const consistency = useMemo(() => buildConsistency(sessions, selectedVariety), [sessions, selectedVariety])

  const metrics = useMemo(() => {
    const total = filteredSessions.length
    const verified = filteredSessions.filter((s) => s.verdict === 'verified').length
    const flagged = filteredSessions.filter((s) => s.verdict === 'needs_review').length
    return [
      { label: 'Total Sessions', value: String(total) },
      { label: 'Verified', value: String(verified) },
      { label: 'Flagged', value: String(flagged) },
    ]
  }, [filteredSessions])

  // Class breakdown for the selected filter
  const classCounts = useMemo(() => {
    const counts = { Waxy: 0, Low: 0, Intermediate: 0, High: 0 }
    for (const s of filteredSessions) {
      if (counts[s.amyloseClass] !== undefined) counts[s.amyloseClass]++
    }
    return counts
  }, [filteredSessions])

  return (
      <div className="module-grid">
        {/* Filter bar */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <label style={{ fontSize: '0.75rem', color: '#556' }}>VARIETY</label>
            <select value={selectedVariety} onChange={(e) => setSelectedVariety(e.target.value)} style={{ padding: '0.4rem' }}>
              <option value="all">All Varieties</option>
              {varieties.map((v) => (
                  <option key={v.id ?? v.name} value={v.name}>{v.name}</option>
              ))}
            </select>
          </div>
          {loading && <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Loading…</span>}
        </div>

        {!!error && (
            <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: 8, background: '#fff1f2', color: '#9f1239', border: '1px solid #fecdd3' }}>
              {error}
            </div>
        )}

        {/* Summary cards */}
        <section className="hero-grid">
          {metrics.map((m) => (
              <article key={m.label} className="card">
                <div className="card-title">{m.label}</div>
                <div className="stat-number" style={{ fontSize: '2rem' }}>{m.value}</div>
              </article>
          ))}
        </section>

        {/* Charts */}
        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          <article className="section-card">
            <div className="section-head">
              <div>
                <h2 className="section-title">Session Counts by Amylose Class</h2>
                <div className="section-subtitle">Completed sessions over time</div>
              </div>
            </div>
            {error ? (
              <p style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>Analytics data is unavailable until backend access is restored.</p>
            ) : trend.length === 0 ? (
                <p style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>No session data yet.</p>
            ) : (
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <BarChart data={trend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Waxy"         fill="#3b82f6" />
                      <Bar dataKey="Low"          fill="#14b8a6" />
                      <Bar dataKey="Intermediate" fill="#f59e0b" />
                      <Bar dataKey="High"         fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
            )}
          </article>

          <article className="section-card">
            <div className="section-head">
              <div>
                <h2 className="section-title">Variety Consistency Over Years</h2>
                <div className="section-subtitle">Mean amylose ordinal of verified sessions</div>
              </div>
            </div>
            {error ? (
              <p style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>Consistency data is unavailable until backend access is restored.</p>
            ) : consistency.length === 0 ? (
                <p style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>No verified session data yet.</p>
            ) : (
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <LineChart data={consistency}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis domain={[1, 4]} ticks={[1, 2, 3, 4]}
                             tickFormatter={(v) => ['', 'Waxy', 'Low', 'Int.', 'High'][v] ?? v} />
                      <Tooltip formatter={(v, name) => [v, 'Avg Ordinal']} />
                      <Line type="monotone" dataKey="current" stroke="#0f4db3" strokeWidth={3} dot />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
            )}
          </article>
        </section>

        {/* Class distribution breakdown */}
        <section style={{ marginTop: '1rem' }}>
          <article className="section-card">
            <div className="section-head">
              <h2 className="section-title">Amylose Class Breakdown</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '0.5rem' }}>
              {AMYLOSE_CLASSES.map((cls) => (
                  <div key={cls} className="card" style={{ textAlign: 'center' }}>
                    <div className="card-title">{cls}</div>
                    <div className="stat-number" style={{ fontSize: '1.75rem' }}>{classCounts[cls]}</div>
                    <div className="stat-caption">sessions</div>
                  </div>
              ))}
            </div>
          </article>
        </section>
      </div>
  )
}