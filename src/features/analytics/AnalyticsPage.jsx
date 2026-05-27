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
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'

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

  const [season, setSeason] = useState('Wet 2026')
  const [selectedVariety, setSelectedVariety] = useState('IR64')
  const [topLots, setTopLots] = useState([
    { lot: 'LOT-992', station: 'Station 4 - South Wing', samples: 248, avg: '14.2s' },
    { lot: 'LOT-981', station: 'Station 2 - North', samples: 193, avg: '12.7s' },
    { lot: 'LOT-970', station: 'Station 1 - East', samples: 154, avg: '15.1s' },
  ])

  useEffect(() => {
    let active = true

    api
      .getAnalytics()
      .then((data) => {
        if (active) {
          setAnalytics(normalizeAnalytics(data))
          // populate top lots/table from API if available
          if (data && (data.topLots || data.top_lots)) {
            setTopLots(data.topLots ?? data.top_lots)
          }
        }
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

  const tableData = useMemo(() => topLots, [topLots])

  const columns = useMemo(() => [
    { accessorKey: 'lot', header: 'Top Performing Lot' },
    { accessorKey: 'station', header: 'Station' },
    { accessorKey: 'samples', header: 'Samples' },
    { accessorKey: 'avg', header: 'Processing Speed' },
  ], [])

  const table = useReactTable({ data: tableData, columns, getCoreRowModel: getCoreRowModel() })

  return (
    <div className="module-grid">
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <label style={{ fontSize: '0.75rem', color: '#556' }}>SEASON</label>
          <select value={season} onChange={(e) => setSeason(e.target.value)} style={{ padding: '0.4rem' }}>
            <option>Wet 2026</option>
            <option>Dry 2025</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <label style={{ fontSize: '0.75rem', color: '#556' }}>VARIETY</label>
          <select value={selectedVariety} onChange={(e) => setSelectedVariety(e.target.value)} style={{ padding: '0.4rem' }}>
            <option>IR64</option>
            <option>IRRI-9</option>
          </select>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button className="outline-button">Update View</button>
        </div>
      </div>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <article className="section-card">
          <div className="section-head">
            <div>
              <h2 className="section-title">TrendChartView (Bar): Session Counts by Amylose Class</h2>
              <div className="section-subtitle">Completed Sessions</div>
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
              <h2 className="section-title">ConsistencyChartView (Line): Variety-Specific Results vs GQ-RIS Mean</h2>
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

      <section style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginTop: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="card blue-panel" style={{ padding: '1.25rem' }}>
            <div className="card-title" style={{ color: '#fff' }}>AI Recommendation</div>
            <p style={{ color: '#fff', marginTop: '0.5rem' }}>Based on the 'Wet 2026' trend for IR64, we suggest adjusting the extraction temperature by +2°C to normalize amylose solubilization rates to match dry season benchmarks.</p>
          </div>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <div className="card">
              <div className="card-title">Top Performing Lot</div>
              <div style={{ fontWeight: 700 }}>LOT-992</div>
              <div className="stat-caption">Station 4 - South Wing</div>
            </div>
            <div className="card">
              <div className="card-title">Processing Speed</div>
              <div style={{ fontWeight: 700, fontSize: '1.25rem' }}>14.2s</div>
              <div className="stat-caption">avg/session</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Top Lots</div>
          <div style={{ marginTop: '0.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id} style={{ textAlign: 'left', padding: '0.5rem', fontSize: '0.85rem' }}>{flexRender(header.column.columnDef.header, header.getContext())}</th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} style={{ padding: '0.5rem', borderTop: '1px solid #f0f0f0' }}>{flexRender(cell.column.columnDef.cell ?? cell.column.columnDef.accessorKey, cell.getContext())}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
