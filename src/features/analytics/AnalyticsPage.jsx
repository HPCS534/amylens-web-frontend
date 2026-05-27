import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { api } from '../../api/client'

function normalizeAnalytics(payload) {
  if (!payload || typeof payload !== 'object') return { trend: [], consistency: [] }

  const trend = payload.trend ?? payload.byClass ?? payload.sessionCounts ?? []
  const consistency = payload.consistency ?? payload.varietyConsistency ?? []

  return {
    trend: Array.isArray(trend) ? trend : [],
    consistency: Array.isArray(consistency) ? consistency : [],
  }
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState({ trend: [], consistency: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await api.getAnalytics()
        if (!active) return

        if (!data || typeof data !== 'object') {
          throw new Error('Analytics payload was empty or invalid.')
        }

        setAnalytics(normalizeAnalytics(data))
      } catch (err) {
        if (active) {
          setError(err?.message || 'Analytics data could not be loaded.')
          setAnalytics({ trend: [], consistency: [] })
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    load()

    return () => {
      active = false
    }
  }, [])

  const metrics = useMemo(() => {
    const total = analytics.trend.reduce((sum, entry) => sum + (entry.Waxy ?? 0) + (entry.Low ?? 0) + (entry.Intermediate ?? 0) + (entry.High ?? 0), 0)
    return [
      { label: 'Sampled sessions', value: total.toString() },
      { label: 'Verified varieties', value: String(analytics.consistency.length) },
      { label: 'Dashboard freshness', value: loading ? 'Loading' : 'Live' },
    ]
  }, [analytics, loading])

  return (
    <div className="module-grid">
      {loading && (
        <section className="section-card" style={{ padding: '1rem 1.25rem' }}>
          <div className="card-title">Loading analytics…</div>
          <p className="help-note" style={{ marginTop: '0.35rem' }}>Fetching trend, consistency, and top-lot data from the backend.</p>
        </section>
      )}

      {error && (
        <section className="section-card" style={{ padding: '1rem 1.25rem', border: '1px solid #fecaca', background: '#fff1f2' }}>
          <div className="card-title" style={{ color: '#b91c1c' }}>Analytics unavailable</div>
          <p className="help-note" style={{ marginTop: '0.35rem', color: '#991b1b' }}>{error}</p>
        </section>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button
          className="outline-button"
          type="button"
          onClick={() => {
            setLoading(true)
            api
              .getAnalytics()
              .then((data) => {
                setAnalytics(normalizeAnalytics(data))
                setError('')
              })
              .catch((err) => {
                setError(err?.message || 'Analytics data could not be loaded.')
              })
              .finally(() => setLoading(false))
          }}
        >
          Update View
        </button>
      </div>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem' }}>
        {metrics.map((metric) => (
          <article key={metric.label} className="section-card">
            <div className="card-title">{metric.label}</div>
            <div className="stat-number" style={{ fontSize: '2rem', marginTop: '0.35rem' }}>{metric.value}</div>
          </article>
        ))}
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <article className="section-card">
          <div className="section-head">
            <div>
              <h2 className="section-title">TrendChartView (Bar): Session Counts by Amylose Class</h2>
              <div className="section-subtitle">Completed sessions grouped by class</div>
            </div>
          </div>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={analytics.trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Waxy" fill="#3b82f6" />
                <Bar dataKey="Low" fill="#14b8a6" />
                <Bar dataKey="Intermediate" fill="#f59e0b" />
                <Bar dataKey="High" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="section-card">
          <div className="section-head">
            <div>
              <h2 className="section-title">ConsistencyChartView (Line): Variety-Specific Results vs GQ-RIS Mean</h2>
              <div className="section-subtitle">Variety results compared with the historical baseline</div>
            </div>
          </div>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <LineChart data={analytics.consistency}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="historical" stroke="#64748b" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="current" stroke="#0f4db3" strokeWidth={3} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>
    </div>
  )
}
