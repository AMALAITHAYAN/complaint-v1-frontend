// DMS Admin Dashboard — Full Featured, Single-File, Routerless (Internal State)
// Tech: React + TypeScript-friendly JSX, TailwindCSS, lucide-react icons, recharts
// Notes:
// - No ReactDOM.createRoot or external router (avoids double-mount & invalid hook issues).
// - Clickable sections (1..6) navigate to detail views using a simple view state machine.
// - Section 4 (Export Status) opens a dedicated, fully specced layout with left sidebar, tabs, controls, and a job table.
// - Section 1/2/3 show tiny "live" movement: numbers tick up by 0–2 every few seconds to feel believable.
// - All strings are single-line or template literals to avoid unterminated string constants in TSX/Babel.
// - Tooltip styles use valid object literals (no nested quotes mistakes).
// - Uses lucide-react + recharts.

import React, { useEffect, useMemo, useState } from 'react'
import {
  // App shell
  LayoutDashboard, Search, Settings, RefreshCw,
  // Section icons
  Table2, TrendingUp, Users, Activity, Package, FileText, CheckCircle, XCircle,
  // Misc controls/icons
  Filter, Calendar, ChevronRight, Download, Upload, Archive, Shield, HardDrive, Database, Zap, Globe, UserMinus, User,
  // Charts/indicators
  BarChart3, PieChart as PieChartIcon,
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart, Line,
  BarChart, Bar,
  AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'

/* ---------------------------------------------
 * Local "Router" — which view to render
 * ------------------------------------------- */
const VIEWS = {
  DASHBOARD: 'DASHBOARD',
  EXPORT_STATUS: 'EXPORT_STATUS',
  CURRENT_BATCH: 'CURRENT_BATCH',
  ACTIVE_USERS: 'ACTIVE_USERS',
  PRODUCTIVITY: 'PRODUCTIVITY',
  USER_ACTIVITY: 'USER_ACTIVITY',
  BATCH_PROCESSING: 'BATCH_PROCESSING',
} as const
type ViewKey = typeof VIEWS[keyof typeof VIEWS]

/* ---------------------------------------------
 * UI Primitives
 * ------------------------------------------- */
const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`rounded-2xl border border-white/10 bg-white/5 shadow-sm ${className}`}>{children}</div>
)
const CardHeader: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`p-4 border-b border-white/10 ${className}`}>{children}</div>
)
const CardTitle: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <h3 className={`font-semibold text-white ${className}`}>{children}</h3>
)
const CardContent: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`p-4 ${className}`}>{children}</div>
)
const Button: React.FC<{
  className?: string
  onClick?: () => void
  children: React.ReactNode
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
}> = ({ className = '', onClick, children, variant = 'default', size = 'md', type = 'button' }) => {
  const v = {
    default: 'bg-white/10 hover:bg-white/20 border border-white/20 text-white',
    outline: 'bg-transparent hover:bg-white/10 border border-white/20 text-white',
    ghost: 'bg-transparent hover:bg-white/5 text-white',
  }[variant]
  const s = {
    sm: 'h-8 px-3 text-xs rounded-lg',
    md: 'h-10 px-4 text-sm rounded-xl',
    lg: 'h-12 px-5 text-base rounded-2xl',
  }[size]
  return (
    <button type={type} onClick={onClick} className={`${v} ${s} inline-flex items-center gap-2 transition ${className}`}>
      {children}
    </button>
  )
}
const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className={`h-10 w-full rounded-xl bg-black/20 border border-white/10 px-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 ${props.className || ''}`}
  />
)

/* ---------------------------------------------
 * Helpers & Demo Data
 * ------------------------------------------- */
const mkTrend = (n: number, base = 50, amp = 20, step = 2) =>
  Array.from({ length: n }).map((_, i) => ({ x: i + 1, y: Math.round(base + Math.sin(i / 2) * amp + i * step) }))
const trend12 = mkTrend(12)
const trend6 = mkTrend(6)
const randStep = () => Math.floor(Math.random() * 3) // 0..2

/* ---------------------------------------------
 * Export helpers
 * ------------------------------------------- */
function exportJobsToPDF() {
  try {
    const printWindow = window.open('', '_blank')
    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Job Export</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; }
    h1 { margin: 0 0 8px; }
    p { margin: 0; color: #444; }
  </style>
</head>
<body>
  <h1>Job Export</h1>
  <p>Generated ${new Date().toLocaleString()}</p>
</body>
</html>`
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      setTimeout(() => {
        printWindow.focus()
        printWindow.print()
      }, 300)
    }
  } catch {
    alert('PDF export failed')
  }
}

function exportJobsToExcel() {
  try {
    const rows = [
      ['Job Name', 'Description', 'Library', 'Pages', 'Last Exported', 'Location'].join(','),
      ['New Connection-43', 'Customer Quote English / undefined', 'New Connections', '01', '2025-08-24T14:38:42Z', '/exports/new-connection-43/out.pdf'].join(','),
      ['Justification-22', 'Internal Memo / undefined', 'Justification', '01', '2025-08-23T10:11:02Z', '/exports/justification-22/out.pdf'].join(','),
      ['Prospection-19', 'Customer Quote English / undefined', 'Prospection', '01', '2025-08-21T18:02:19Z', '/exports/prospection-19/out.pdf'].join(','),
    ]
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `jobs-export-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  } catch {
    alert('Excel export failed')
  }
}

/* ---------------------------------------------
 * Tiny Metric Tile (with optional mini chart)
 * ------------------------------------------- */
const MetricTile: React.FC<{ label: string; value: string | number; chart?: 'line' | 'area' | 'none' }> = ({ label, value, chart = 'area' }) => (
  <div className="rounded-xl border border-white/10 p-3 bg-white/5">
    <div className="text-xs text-gray-400">{label}</div>
    <div className="text-xl font-semibold text-white">{typeof value === 'number' ? value.toLocaleString() : value}</div>
    {chart !== 'none' && (
      <div className="h-12">
        <ResponsiveContainer width="100%" height="100%">
          {chart === 'area' ? (
            <AreaChart data={trend12}>
              <Tooltip
                contentStyle={{
                  background: '#111827',
                  border: '1px solid #374151',
                  borderRadius: 12,
                  color: '#F9FAFB',
                }}
              />
              <Area type="monotone" dataKey="y" fillOpacity={0.2} strokeWidth={2} />
            </AreaChart>
          ) : (
            <LineChart data={trend12}>
              <Tooltip
                contentStyle={{
                  background: '#111827',
                  border: '1px solid #374151',
                  borderRadius: 12,
                  color: '#F9FAFB',
                }}
              />
              <Line type="monotone" dataKey="y" strokeWidth={2} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    )}
  </div>
)

/* ---------------------------------------------
 * 4) Export Status View (full page)
 * ------------------------------------------- */
const ExportStatusView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const rows = useMemo(
    () => [
      { name: 'New Connection-43', desc: 'undefined', lib: 'New Connections', pages: '01', last: '2025-08-24T14:38:42Z', path: '/exports/new-connection-43/out.pdf', status: 'Succeeded' },
      { name: 'New Connection-43', desc: 'Customer Quote English', lib: 'New Connections', pages: '01', last: '2025-08-24T19:40:44Z', path: '/exports/new-connection-43/out2.pdf', status: 'Succeeded' },
      { name: 'New Connection-44', desc: 'undefined', lib: 'New Connections', pages: '01', last: '2025-08-18T20:05:22Z', path: '/exports/new-connection-44/out.pdf', status: 'In Queue' },
      { name: 'Justification-38', desc: 'BON DE LIVRAISON', lib: 'Justification', pages: '01', last: '2025-08-18T20:15:21Z', path: '/exports/justification-38/out.pdf', status: 'Failed' },
      { name: 'Prospection-30', desc: 'undefined', lib: 'Prospection', pages: '01', last: '2025-08-18T18:59:00Z', path: '/exports/prospection-30/out.pdf', status: 'Succeeded' },
    ],
    []
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white grid grid-cols-12 gap-6 p-6 lg:p-8">
      {/* Left Sidebar */}
      <aside className="col-span-12 md:col-span-3 xl:col-span-2 border border-white/10 rounded-2xl bg-white/5">
        <div className="p-3 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search …" />
          </div>
          <div className="mt-2 flex items-center justify-end gap-2 text-xs text-gray-300">
            <span className="px-2 py-1 rounded-lg bg-white/10 border border-white/10">↕</span>
            <span className="px-2 py-1 rounded-lg bg-white/10 border border-white/10">⇅</span>
          </div>
        </div>
        <nav className="p-2 space-y-1">
          {['All Batches', 'New Connection', 'Justification', 'Prospection', 'HR'].map((label) => (
            <button key={label} className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 text-sm">{label}</button>
          ))}
        </nav>
      </aside>

      {/* Main Panel */}
      <section className="col-span-12 md:col-span-9 xl:col-span-10 space-y-4">
        {/* Top Tabs & Controls */}
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              {/* Primary Tabs */}
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 text-xs rounded-lg bg-white/10 border border-white/10">Batch Summary</span>
                <span className="px-3 py-1 text-xs rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-300">Job Details</span>
              </div>
              {/* Secondary Tabs */}
              <div className="flex items-center gap-1 ml-2">
                {['Exported Jobs', 'Succeeded', 'In Queue', 'Failed'].map((t, idx) => (
                  <Button key={t} size="sm" variant={idx === 0 ? 'default' : 'outline'}>{t}</Button>
                ))}
              </div>
              {/* Controls Right */}
              <div className="ml-auto flex items-center gap-2">
                <Input type="text" defaultValue="Aug 17, 2025 – Aug 24, 2025" className="w-56" />
                <select className="h-10 rounded-xl bg-black/20 border border-white/10 px-3 text-sm">
                  <option>Batch instances</option>
                  <option>Match single</option>
                </select>
                <Button variant="outline" size="sm">Sort ↑↓</Button>
                <div className="relative w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input placeholder="Search jobs…" className="pl-9" />
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Job Table */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-base">Exported Jobs</CardTitle>
            <div className="text-xs text-gray-400">Showing {rows.length} records</div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {rows.map((r) => (
                <div key={`${r.name}-${r.last}`} className="grid grid-cols-12 items-center gap-3 p-3 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10">
                  <div className="col-span-12 md:col-span-3">
                    <div className="font-medium text-white">{r.name}</div>
                    <div className="text-xs text-gray-400">{r.desc || '—'}</div>
                  </div>
                  <div className="col-span-6 md:col-span-2 text-sm">
                    <div className="text-gray-400 text-xs">Document Libraries</div>
                    <div className="font-medium">{r.lib}</div>
                  </div>
                  <div className="col-span-6 md:col-span-1 text-sm">
                    <div className="text-gray-400 text-xs">Pages</div>
                    <div className="font-medium">{r.pages}</div>
                  </div>
                  <div className="col-span-6 md:col-span-3 text-sm">
                    <div className="text-gray-400 text-xs">Last Exported</div>
                    <div className="font-mono">{r.last}</div>
                  </div>
                  <div className="col-span-6 md:col-span-3 text-xs truncate">
                    <div className="text-gray-400 text-xs">Exported Location</div>
                    <a className="underline text-cyan-300" href={r.path}>{r.path}</a>
                  </div>
                  {/* Row Sparkline */}
                  <div className="col-span-12">
                    <div className="h-12">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trend6}>
                          <Tooltip
                            contentStyle={{
                              background: '#111827',
                              border: '1px solid #374151',
                              borderRadius: 12,
                              color: '#F9FAFB',
                            }}
                          />
                          <Line type="monotone" dataKey="y" strokeWidth={2} stroke="#3B82F6" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2">
          <Button onClick={exportJobsToPDF}><Download className="w-4 h-4" /> Export to PDF</Button>
          <Button onClick={exportJobsToExcel}><Download className="w-4 h-4" /> Export to Excel</Button>
          <Button variant="outline" className="ml-auto" onClick={onBack}>Back to Dashboard</Button>
        </div>
      </section>
    </div>
  )
}

/* ---------------------------------------------
 * Generic Detail View (for other sections)
 * ------------------------------------------- */
const GenericDetail: React.FC<{ title: string; onBack: () => void; subtitle?: string }>
  = ({ title, onBack, subtitle }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white p-6 lg:p-8">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder={`Search ${title.toLowerCase()}…`} className="pl-9" />
            </div>
            <select className="h-10 rounded-xl bg-black/20 border border-white/10 px-3 text-sm">
              {['All', 'Succeeded', 'In Queue', 'Failed'].map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend12}>
                <Tooltip
                  contentStyle={{
                    background: '#111827',
                    border: '1px solid #374151',
                    borderRadius: 12,
                    color: '#F9FAFB',
                  }}
                />
                <XAxis dataKey="x" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Bar dataKey="y" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-3 rounded-xl border border-white/10 bg-white/5">
                <div className="text-xs text-gray-400">Record {i + 1}</div>
                <div className="text-sm text-white">Details about {title} #{i + 1}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-right">
            <Button variant="outline" onClick={onBack}>Back to Dashboard</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ---------------------------------------------
 * MAIN: Dashboard with small live movement
 * ------------------------------------------- */
export default function DMSDashboard() {
  const [view, setView] = useState<ViewKey>(VIEWS.DASHBOARD)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [dateRange, setDateRange] = useState('last30days')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // "Live" metrics (only UI-level; gently bump numbers)
  const [currentBatch, setCurrentBatch] = useState([
    { label: 'Batches', value: 150 },
    { label: 'Jobs', value: 320 },
    { label: 'Scanning', value: 210 },
    { label: 'Indexing', value: 240 },
    { label: 'Quality', value: 180 },
    { label: 'Re-Scanning', value: 30 },
    { label: 'Re-Indexing', value: 25 },
    { label: 'Re-Quality', value: 12 },
  ])
  const [activeUsers, setActiveUsers] = useState([
    { k: 'Users', v: 138 },
    { k: 'Scan', v: 72 },
    { k: 'Index', v: 51 },
    { k: 'Quality', v: 89 },
  ])
  const [productivity, setProductivity] = useState([
    { label: 'Scanned Documents', value: 1280 },
    { label: 'Scanned Pages', value: 56210 },
    { label: 'Re-Scanned', value: 240 },
    { label: 'Indexed Documents', value: 1180 },
    { label: 'Indexed Pages', value: 54890 },
    { label: 'Reindexed', value: 200 },
    { label: 'Quality Documents', value: 970 },
    { label: 'Quality Pages', value: 42030 },
  ])

  // Tickers for subtle movement
  useEffect(() => {
    const t1 = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Every 4s bump current batch by 0..2
    const t2 = setInterval(() => {
      setCurrentBatch((prev) =>
        prev.map((m, i) => {
          const delta = (i % 3 === 0) ? 0 : randStep() // keep some stable
          return { ...m, value: m.value + delta }
        })
      )
    }, 4000)

    // Every 5s bump active users by 0..2
    const t3 = setInterval(() => {
      setActiveUsers((prev) =>
        prev.map((m, i) => {
          const delta = i === 0 ? randStep() : (randStep() > 1 ? 1 : 0) // Users grows a hair faster
          return { ...m, v: m.v + delta }
        })
      )
    }, 5000)

    // Every 6s bump productivity counts slightly
    const t4 = setInterval(() => {
      setProductivity((prev) =>
        prev.map((m, i) => {
          const delta = i % 2 === 0 ? randStep() : (randStep() ? 1 : 0)
          return { ...m, value: m.value + delta }
        })
      )
    }, 6000)

    return () => {
      clearInterval(t1)
      clearInterval(t2)
      clearInterval(t3)
      clearInterval(t4)
    }
  }, [])

  const dashboardData = useMemo(
    () => ({
      exported: 650,
      failedToExport: 9,
      storageUsed: 2.4,
      storageTotal: 10,
      systemUptime: 99.8,
      securityViolations: 2,
      avgUploadSpeed: 12.5,
      avgSearchTime: 0.8,
      batchJobsTotal: 245,
      batchJobsCompleted: 210,
      batchJobsRunning: 15,
      batchJobsFailed: 20,
    }),
    []
  )

  const documentStatusData = useMemo(
    () => [
      { name: 'Approved', value: 8940, color: '#10B981' },
      { name: 'Rejected', value: 234, color: '#EF4444' },
      { name: 'In Review', value: 80, color: '#3B82F6' },
      { name: 'Archived', value: 2340, color: '#F59E0B' },
    ],
    []
  )
  const departmentData = useMemo(
    () => [
      { name: 'HR', uploads: 4500, exports: 3200 },
      { name: 'Finance', uploads: 3800, exports: 2900 },
      { name: 'IT', uploads: 8200, exports: 6800 },
      { name: 'Operations', uploads: 6100, exports: 4500 },
      { name: 'Sales', uploads: 5000, exports: 3800 },
      { name: 'Legal', uploads: 2400, exports: 1900 },
    ],
    []
  )
  const monthlyTrendData = useMemo(
    () => [
      { month: 'Jan', uploads: 4200, exports: 3240, storage: 1.8, users: 520 },
      { month: 'Feb', uploads: 3800, exports: 3100, storage: 2.0, users: 525 },
      { month: 'Mar', uploads: 5200, exports: 4800, storage: 2.1, users: 535 },
      { month: 'Apr', uploads: 4780, exports: 4200, storage: 2.2, users: 540 },
      { month: 'May', uploads: 5100, exports: 4600, storage: 2.3, users: 545 },
      { month: 'Jun', uploads: 5400, exports: 5000, storage: 2.4, users: 545 },
    ],
    []
  )
  const weeklyActivityData = useMemo(
    () => [
      { day: 'Mon', uploads: 180, searches: 1200, downloads: 450 },
      { day: 'Tue', uploads: 220, searches: 1450, downloads: 520 },
      { day: 'Wed', uploads: 190, searches: 1350, downloads: 480 },
      { day: 'Thu', uploads: 240, searches: 1600, downloads: 580 },
      { day: 'Fri', uploads: 280, searches: 1800, downloads: 620 },
      { day: 'Sat', uploads: 120, searches: 800, downloads: 280 },
      { day: 'Sun', uploads: 80, searches: 600, downloads: 190 },
    ],
    []
  )

  const go = (v: ViewKey) => () => setView(v)
  const back = () => setView(VIEWS.DASHBOARD)

  // Route switch
  if (view !== VIEWS.DASHBOARD) {
    if (view === VIEWS.EXPORT_STATUS) {
      return <ExportStatusView onBack={back} />
    }
    const titleMap: Record<ViewKey, string> = {
      [VIEWS.DASHBOARD]: 'Dashboard',
      [VIEWS.EXPORT_STATUS]: 'Export Status',
      [VIEWS.CURRENT_BATCH]: 'Current Batch',
      [VIEWS.ACTIVE_USERS]: 'Active Users',
      [VIEWS.PRODUCTIVITY]: 'Productivity',
      [VIEWS.USER_ACTIVITY]: 'User Activity',
      [VIEWS.BATCH_PROCESSING]: 'Batch Processing',
    }
    return <GenericDetail title={titleMap[view]} onBack={back} subtitle="Detailed analytics view" />
  }

  /* ------------------ DASHBOARD ------------------ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full p-6 lg:p-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 grid place-items-center">
                <LayoutDashboard className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">Document Management</h1>
                <p className="text-lg text-gray-300">Analytics & Control Center</p>
                <p className="text-xs text-gray-400 mt-1">Last updated: {currentTime.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="search"
                  placeholder="Search documents…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={() => alert('Refreshing dashboard data…')}><RefreshCw className="w-4 h-4" /> Refresh</Button>
                <Button onClick={() => alert('Opening settings…')} variant="outline"><Settings className="w-4 h-4" /> Settings</Button>
              </div>
            </div>
          </div>
        </header>

        {/* Filters */}
        <section className="mb-8">
          <Card>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white text-sm min-w-36"
                  >
                    <option value="today">Today</option>
                    <option value="last7days">Last 7 Days</option>
                    <option value="last30days">Last 30 Days</option>
                    <option value="last90days">Last 90 Days</option>
                    <option value="last6months">Last 6 Months</option>
                  </select>
                </div>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white text-sm min-w-40"
                >
                  <option value="all">All Departments</option>
                  <option value="hr">Human Resources</option>
                  <option value="finance">Finance</option>
                  <option value="it">IT</option>
                  <option value="operations">Operations</option>
                  <option value="sales">Sales</option>
                  <option value="legal">Legal</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white text-sm min-w-32"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="review">Under Review</option>
                  <option value="rejected">Rejected</option>
                </select>
                <Button className="ml-auto"><Filter className="w-4 h-4" /> Apply Filters</Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* === SIX REQUIRED SECTIONS === */}
        <section className="space-y-8">
          {/* 1) Current Batch (LIVE) */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-lg">Current Batch</CardTitle>
              <span className="text-xs text-gray-400">Batches · Jobs · Scanning · Indexing · Quality · Re-*</span>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
                {currentBatch.map(({ label, value }) => (
                  <MetricTile key={label} label={label} value={value} chart="area" />
                ))}
              </div>
              <div className="mt-4 text-right">
                <Button variant="outline" onClick={go(VIEWS.CURRENT_BATCH)}>Open details</Button>
              </div>
            </CardContent>
          </Card>

          {/* 2) Active Users (LIVE) */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-lg">Active Users</CardTitle>
              <span className="text-xs text-cyan-300">Live</span>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {activeUsers.map(({ k, v }) => (
                  <div key={k} className="rounded-xl border border-white/10 p-4 bg-white/5">
                    <div className="text-xs text-gray-400">{k}</div>
                    <div className="text-2xl font-semibold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                {[
                  { name: 'Scan', v: Math.min(100, 60 + (activeUsers[1]?.v % 40)) },
                  { name: 'Index', v: Math.min(100, 50 + (activeUsers[2]?.v % 50)) },
                  { name: 'Quality', v: Math.min(100, 70 + (activeUsers[3]?.v % 30)) },
                ].map((p) => (
                  <div key={p.name} className="p-3 rounded-xl border border-white/10 bg-white/5">
                    <div className="flex items-center justify-between text-xs">
                      <span>{p.name}</span>
                      <span className="font-medium">{p.v}%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-white/10">
                      <div className="h-2 rounded-full bg-white" style={{ width: `${p.v}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-right">
                <Button variant="outline" onClick={go(VIEWS.ACTIVE_USERS)}>Open details</Button>
              </div>
            </CardContent>
          </Card>

          {/* 3) Productivity (LIVE) */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-lg">Productivity</CardTitle>
              <TrendingUp className="w-4 h-4 text-gray-300" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
                {productivity.map((m) => (
                  <MetricTile key={m.label} label={m.label} value={m.value} chart="none" />
                ))}
              </div>
              <div className="mt-4 h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trend12}>
                    <Tooltip
                      contentStyle={{
                        background: '#111827',
                        border: '1px solid #374151',
                        borderRadius: 12,
                        color: '#F9FAFB',
                      }}
                    />
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="x" />
                    <YAxis />
                    <Bar dataKey="y" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-right">
                <Button variant="outline" onClick={go(VIEWS.PRODUCTIVITY)}>Open details</Button>
              </div>
            </CardContent>
          </Card>

          {/* 4) Export Status — click to dedicated page */}
          <Card
  className="cursor-pointer hover:bg-white/5 transition"
  onClick={go(VIEWS.EXPORT_STATUS)}
>
  <CardHeader className="flex items-center justify-between">
    <CardTitle className="text-lg flex items-center gap-2">
      <Table2 className="w-5 h-5" /> Export Status
    </CardTitle>

    <div className="flex items-center gap-2">
      <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs">
        Succeeded
      </span>
      <span className="px-2 py-0.5 rounded bg-red-500/20 border border-red-500/30 text-red-300 text-xs">
        Failed
      </span>

      {/* 👉 Explicit button */}
      <Button size="sm" variant="outline" onClick={go(VIEWS.EXPORT_STATUS)}>
        Open details
      </Button>
    </div>
  </CardHeader>

  <CardContent>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="rounded-xl border border-white/10 p-4 bg-white/5">
        <div className="text-xs text-gray-400">Succeeded</div>
        <div className="text-2xl font-semibold">
          {dashboardData.exported}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 p-4 bg-white/5">
        <div className="text-xs text-gray-400">Failed</div>
        <div className="text-2xl font-semibold">
          {dashboardData.failedToExport}
        </div>
      </div>

      <div className="col-span-2 h-28">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trend12}>
            <Tooltip
              contentStyle={{
                background: '#111827',
                border: '1px solid #374151',
                borderRadius: 12,
                color: '#F9FAFB',
              }}
            />
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" />
            <YAxis />
            <Line type="monotone" dataKey="y" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>

    <p className="text-xs text-gray-400 mt-2">
      Click to view detailed Job Details → Exported / Succeeded / In Queue / Failed
    </p>
  </CardContent>
</Card>



          {/* 5) User Activity */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-lg">User Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { k: 'Active Users', v: activeUsers[0].v },
                  { k: 'Inactive Users', v: 18 },
                  { k: 'Disabled Users', v: 4 },
                  { k: 'Total Users', v: 154 + (activeUsers[0].v - 138) },
                ].map(({ k, v }) => (
                  <div key={k} className="rounded-xl border border-white/10 p-4 bg-white/5">
                    <div className="text-xs text-gray-400">{k}</div>
                    <div className="text-2xl font-semibold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-right">
                <Button variant="outline" onClick={go(VIEWS.USER_ACTIVITY)}>Open details</Button>
              </div>
            </CardContent>
          </Card>

          {/* 6) Batch Processing */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-lg">Batch Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Total Jobs', 'Completed', 'Running', 'Failed'].map((k, i) => (
                  <div key={k} className="rounded-xl border border-white/10 p-4 bg-white/5">
                    <div className="text-xs text-gray-400">{k}</div>
                    <div className="text-2xl font-semibold">{[
                      dashboardData.batchJobsTotal,
                      dashboardData.batchJobsCompleted,
                      dashboardData.batchJobsRunning,
                      dashboardData.batchJobsFailed,
                    ][i]}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend12}>
                    <Tooltip
                      contentStyle={{
                        background: '#111827',
                        border: '1px solid #374151',
                        borderRadius: 12,
                        color: '#F9FAFB',
                      }}
                    />
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="x" />
                    <YAxis />
                    <Line type="monotone" dataKey="y" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-right">
                <Button variant="outline" onClick={go(VIEWS.BATCH_PROCESSING)}>Open details</Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Deep-dive charts */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-8 my-10">
          {/* Document Status Distribution */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-2xl">Document Status Distribution</CardTitle>
              <Button onClick={() => alert('Viewing detailed document status breakdown with filtering options')}>View Details</Button>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={documentStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={120} paddingAngle={4} dataKey="value">
                      {documentStatusData.map((d, i) => (
                        <Cell key={i} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#111827',
                        border: '1px solid #374151',
                        borderRadius: 12,
                        color: '#F9FAFB',
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Department Performance */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-2xl">Department Performance</CardTitle>
              <Button onClick={() => alert('Opening department analytics with performance metrics and comparisons')}>Analyze</Button>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} angle={-45} textAnchor="end" height={80} interval={0} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: '#111827',
                        border: '1px solid #374151',
                        borderRadius: 12,
                        color: '#F9FAFB',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="uploads" name="Uploads" radius={[4, 4, 0, 0]} fill="#3B82F6" />
                    <Bar dataKey="exports" name="Exports" radius={[4, 4, 0, 0]} fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Monthly Trends */}
        <section className="grid grid-cols-1 gap-8 my-10">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-2xl">6-Month Performance Trends</CardTitle>
              <div className="flex items-center gap-2">
                <Button onClick={() => alert('Opening predictive analytics and trend forecasting')}>Forecast</Button>
                <Button onClick={() => alert('Exporting trend data to CSV format')} variant="outline">Export Data</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: '#111827',
                        border: '1px solid #374151',
                        borderRadius: 12,
                        color: '#F9FAFB',
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="uploads" stroke="#3B82F6" strokeWidth={4} dot={{ r: 3 }} name="Document Uploads" />
                    <Line type="monotone" dataKey="exports" stroke="#10B981" strokeWidth={4} dot={{ r: 3 }} name="Document Exports" />
                    <Line type="monotone" dataKey="users" stroke="#F59E0B" strokeWidth={4} dot={{ r: 3 }} name="Active Users" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Weekly Activity + Storage & Performance */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-8 my-10">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-2xl">Weekly Activity</CardTitle>
              <Button onClick={() => alert('Opening weekly activity analysis with hourly breakdowns')}>Deep Dive</Button>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyActivityData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: '#111827',
                        border: '1px solid #374151',
                        borderRadius: 12,
                        color: '#F9FAFB',
                      }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="uploads" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.4} name="Uploads" />
                    <Area type="monotone" dataKey="searches" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.4} name="Searches" />
                    <Area type="monotone" dataKey="downloads" stackId="3" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.4} name="Downloads" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-2xl">Storage & Performance</CardTitle>
              <Button onClick={() => alert('Opening system diagnostics and performance monitoring')}>Diagnostics</Button>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300 font-medium">Storage Usage</span>
                  <span className="text-white font-semibold">{dashboardData.storageUsed}TB / {dashboardData.storageTotal}TB</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div className="h-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{ width: `${(dashboardData.storageUsed / dashboardData.storageTotal) * 100}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1"><span>0TB</span><span>{dashboardData.storageTotal}TB</span></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2"><Activity className="w-4 h-4 text-green-400" /><span className="text-sm text-gray-300">System Uptime</span></div>
                  <div className="text-2xl font-bold text-green-400">{dashboardData.systemUptime}%</div>
                  <div className="text-xs text-gray-400">Last 30 days</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2"><Zap className="w-4 h-4 text-blue-400" /><span className="text-sm text-gray-300">Upload Speed</span></div>
                  <div className="text-2xl font-bold text-blue-400">{dashboardData.avgUploadSpeed}MB/s</div>
                  <div className="text-xs text-gray-400">Average</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2"><Search className="w-4 h-4 text-purple-400" /><span className="text-sm text-gray-300">Search Time</span></div>
                  <div className="text-2xl font-bold text-purple-400">{dashboardData.avgSearchTime}s</div>
                  <div className="text-xs text-gray-400">Average</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2"><Shield className="w-4 h-4 text-red-400" /><span className="text-sm text-gray-300">Security Incidents</span></div>
                  <div className="text-2xl font-bold text-red-400">{dashboardData.securityViolations}</div>
                  <div className="text-xs text-gray-400">Incidents</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="text-center text-gray-400 text-sm py-8 border-t border-gray-800/50">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <span className="text-lg">© 2025 Document Management System</span>
            <span className="hidden sm:inline text-gray-600">•</span>
            <span>Last updated: {currentTime.toLocaleString()}</span>
            <span className="hidden sm:inline text-gray-600">•</span>
            <Button
              onClick={() =>
                alert(`System Health Report:

• Uptime: 99.8%
• Server Status: Healthy
• Database: Online
• Storage: Optimal
• Network: Stable
• Last Maintenance: 3 days ago`)
              }
              variant="outline"
            >
              System Status: Online
            </Button>
          </div>
        </footer>
      </div>
    </div>
  )
}
