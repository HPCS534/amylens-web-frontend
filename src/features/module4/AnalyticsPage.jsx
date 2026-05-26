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

const fallbackTrend = [
  { label: 'Jan', Waxy: 14, Low: 20, Intermediate: 18, High: 9 },
  { label: 'Feb', Waxy: 11, Low: 22, Intermediate: 15, High: 13 },
  { label: 'Mar', Waxy: 16, Low: 18, Intermediate: 19, High: 17 },
  { label: 'Apr', Waxy: 18, Low: 25, Intermediate: 21, High: 15 },
]

const fallbackConsistency = [
  { label: '2019', historical: 2.8, current: 3.1 },
  { label: '2020', historical: 3.1, current: 3.0 },
  { label: '2021', historical: 3.0, current: 3.4 },
  { label: '2022', historical: 3.3, current: 3.2 },
  { label: '2023', historical: 3.4, current: 3.6 },
]

function normalizeAnalytics(payload) {
  if (!payload || typeof payload !== 'object') return { trend: fallbackTrend, consistency: fallbackConsistency }

  const trend = payload.trend ?? payload.byClass ?? payload.sessionCounts ?? fallbackTrend
  const consistency = payload.consistency ?? payload.varietyConsistency ?? fallbackConsistency

  return {
    trend: Array.isArray(trend) ? trend : fallbackTrend,
    consistency: Array.isArray(consistency) ? consistency : fallbackConsistency,
  }
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState({ trend: fallbackTrend, consistency: fallbackConsistency })

  useEffect(() => {
    let active = true

    api
      .getAnalytics()
      .then((data) => {
        if (active) setAnalytics(normalizeAnalytics(data))
      })
      .catch(() => {
        if (active) setAnalytics({ trend: fallbackTrend, consistency: fallbackConsistency })
      })

    return () => {
      active = false
    }
  }, [])

  const metrics = useMemo(() => {
    const total = analytics.trend.reduce((sum, entry) => sum + (entry.Waxy ?? 0) + (entry.Low ?? 0) + (entry.Intermediate ?? 0) + (entry.High ?? 0), 0)
    return [
      { label: 'Sampled sessions', value: total.toString() },
      { label: 'Verified varieties', value: String(analytics.consistency.length) },
      { label: 'Dashboard freshness', value: 'Live' },
    ]
  }, [analytics])

  return (
    <div className="module-grid">
      <section className="hero-grid">
        {metrics.map((metric) => (
          <article key={metric.label} className="card">
            <div className="card-title">{metric.label}</div>
            <div className="stat-number" style={{ fontSize: '2rem' }}>{metric.value}</div>
            <div className="stat-caption">Module 4 analytics snapshot</div>
          </article>
        ))}
      </section>

      <section className="chart-grid">
        <article className="section-card">
          <div className="section-head">
            <div>
              <h2 className="section-title">Trend Chart View</h2>
              <div className="section-subtitle">Amylose class distribution over time</div>
            </div>
            <button className="ghost-button" type="button">Select Variety</button>
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
              <h2 className="section-title">Consistency View</h2>
              <div className="section-subtitle">Selected variety compared with GQ-RIS baseline</div>
            </div>
            <button className="ghost-button" type="button">Export</button>
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
