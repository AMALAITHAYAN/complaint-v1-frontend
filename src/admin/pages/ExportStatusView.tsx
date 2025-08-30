import React, { useMemo, useState } from 'react'
import {
  Search, Download, ChevronDown, ChevronUp, Filter, Calendar, CheckCircle2, XCircle, Timer
} from 'lucide-react'
import {
  ResponsiveContainer, LineChart, Line, Tooltip
} from 'recharts'

/* ──────────────────────────────────────────────────────────────────────────
   Small reusable primitives
   ────────────────────────────────────────────────────────────────────────── */
const Card = ({ children, className = '' }) => (
  <div className={`rounded-2xl border border-white/10 bg-white/5 shadow-sm ${className}`}>{children}</div>
)
const CardHeader = ({ children, className = '' }) => (
  <div className={`p-4 border-b border-white/10 ${className}`}>{children}</div>
)
const CardContent = ({ children, className = '' }) => (
  <div className={`p-4 ${className}`}>{children}</div>
)
const Button = ({ children, onClick, className = '', variant = 'default', disabled = false, type = 'button' }) => {
  const v = {
    default: 'bg-white/10 hover:bg-white/20 border border-white/20 text-white',
    outline: 'bg-transparent hover:bg-white/10 border border-white/20 text-white',
    subtle: 'bg-white/[0.06] hover:bg-white/[0.09] border border-white/10 text-white',
    primary: 'bg-cyan-600/90 hover:bg-cyan-600 text-white border border-cyan-500/40',
  }[variant]
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${v} h-10 px-4 rounded-xl text-sm inline-flex items-center gap-2 transition ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  )
}
const Input = (props) => (
  <input
    {...props}
    className={`h-10 w-full rounded-xl bg-black/20 border border-white/10 px-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 ${props.className || ''}`}
  />
)
const Badge = ({ children, color = 'slate' }) => {
  const map = {
    green: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    red: 'bg-red-500/15 text-red-300 border-red-500/30',
    blue: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    slate: 'bg-white/10 text-gray-200 border-white/10',
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded border ${map[color]}`}>{children}</span>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
   Demo data
   ────────────────────────────────────────────────────────────────────────── */
// Tiny sparkline seed
const mkTrend = () => Array.from({ length: 6 }).map((_, i) => ({ x: i, y: Math.round(28 + Math.random() * 24) }))

// Base rows (static)
const BASE_ROWS = [
  { name: 'New Connection-43', desc: 'undefined',                         lib: 'New Connections', pages: '01', last: '2025-08-24T14:38:42Z', path: '/exports/new-connection-43/out.pdf',  status: 'Succeeded' },
  { name: 'New Connection-43', desc: 'Customer Quote English',            lib: 'New Connections', pages: '01', last: '2025-08-24T14:40:44Z', path: '/exports/new-connection-43/out2.pdf', status: 'Succeeded' },
  { name: 'New Connection-44', desc: 'undefined',                         lib: 'New Connections', pages: '01', last: '2025-08-23T18:05:22Z', path: '/exports/new-connection-44/out.pdf',  status: 'In Queue'  },
  { name: 'Justification-38', desc: 'BON DE LIVRAISON',                   lib: 'Justification',   pages: '01', last: '2025-08-22T12:15:21Z', path: '/exports/justification-38/out.pdf',   status: 'Failed'    },
  { name: 'Prospection-30',  desc: 'undefined',                           lib: 'Prospection',     pages: '01', last: '2025-08-21T10:05:22Z', path: '/exports/prospection-30/out.pdf',    status: 'Succeeded' },
  { name: 'HR-07',           desc: 'Policy Document / v2',                lib: 'HR',              pages: '01', last: '2025-08-20T09:15:10Z', path: '/exports/hr-07/out.pdf',              status: 'Succeeded' },
  { name: 'Justification-30',desc: 'Approval Note / undefined',           lib: 'Justification',   pages: '01', last: '2025-08-19T12:22:07Z', path: '/exports/justification-30/out.pdf',  status: 'Succeeded' },
  { name: 'New Connection-44',desc:'Customer Quote Hindi / undefined',    lib: 'New Connections', pages: '01', last: '2025-08-18T19:37:54Z', path: '/exports/new-connection-44/hin.pdf', status: 'Failed'    },
].map(r => ({ ...r, trend: mkTrend() }))

/* ──────────────────────────────────────────────────────────────────────────
   Helpers: export to PDF/Excel
   ────────────────────────────────────────────────────────────────────────── */
function exportRowsToPDF(rows) {
  try {
    const html = `<!doctype html><html><head>
      <meta charset="utf-8" />
      <title>Exported Jobs</title>
      <style>
        body{font-family: Inter,system-ui,Segoe UI,Arial,sans-serif; margin:24px; color:#111}
        h1{margin:0 0 6px 0;font-size:20px}
        .sub{color:#444;margin-bottom:16px}
        table{border-collapse:collapse;width:100%}
        th,td{border:1px solid #ddd;padding:8px;font-size:12px}
        th{background:#f4f6f8;text-align:left}
        tr:nth-child(even){background:#fafafa}
        .small{font-size:11px;color:#555}
      </style>
    </head><body>
      <h1>Exported Jobs</h1>
      <div class="sub small">Generated: ${new Date().toISOString()}</div>
      <table>
        <thead>
          <tr>
            <th>Job Name</th><th>Description</th><th>Document Library</th><th>Pages</th><th>Last Exported</th><th>Exported Location</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${
            rows.map(r => (
              `<tr>
                 <td>${r.name}</td>
                 <td>${r.desc || ''}</td>
                 <td>${r.lib}</td>
                 <td>${r.pages}</td>
                 <td>${r.last}</td>
                 <td>${r.path}</td>
                 <td>${r.status}</td>
               </tr>`
            )).join('')
          }
        </tbody>
      </table>
    </body></html>`

    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(html)
    w.document.close()
    setTimeout(() => { w.focus(); w.print() }, 300)
  } catch (err) {
    console.error(err)
    alert('PDF export failed')
  }
}

function exportRowsToCSV(rows) {
  try {
    const header = ['Job Name','Description','Document Library','Pages','Last Exported','Exported Location','Status']
    const csv = [
      header.join(','),
      ...rows.map(r =>
        [r.name, r.desc||'', r.lib, r.pages, r.last, r.path, r.status]
          .map(v => `"${String(v).replaceAll('"','""')}"`).join(',')
      )
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `exported-jobs-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error(err)
    alert('Excel export failed')
  }
}

/* ──────────────────────────────────────────────────────────────────────────
   Main Component
   ────────────────────────────────────────────────────────────────────────── */
export default function ExportStatusView({ onBack }) {
  // Sidebar category
  const [category, setCategory] = useState('All Batches')
  // Status tab
  const [statusTab, setStatusTab] = useState('Exported Jobs') // Succeeded | In Queue | Failed
  // Job search
  const [jobQuery, setJobQuery] = useState('')
  // Sort
  const [sortAsc, setSortAsc] = useState(false)

  // Filter by sidebar category
  const categoryFiltered = useMemo(() => {
    if (category === 'All Batches') return BASE_ROWS
    if (category === 'New Connection') return BASE_ROWS.filter(r => r.lib === 'New Connections')
    if (category === 'Justification') return BASE_ROWS.filter(r => r.lib === 'Justification')
    if (category === 'Prospection')  return BASE_ROWS.filter(r => r.lib === 'Prospection')
    if (category === 'HR')           return BASE_ROWS.filter(r => r.lib === 'HR')
    return BASE_ROWS
  }, [category])

  // Filter by status tab
  const statusFiltered = useMemo(() => {
    if (statusTab === 'Exported Jobs') return categoryFiltered
    return categoryFiltered.filter(r => r.status === statusTab)
  }, [statusTab, categoryFiltered])

  // Search filter
  const searched = useMemo(() => {
    const q = jobQuery.trim().toLowerCase()
    if (!q) return statusFiltered
    return statusFiltered.filter(r =>
      (r.name?.toLowerCase() || '').includes(q) ||
      (r.desc?.toLowerCase() || '').includes(q) ||
      (r.lib?.toLowerCase() || '').includes(q) ||
      (r.path?.toLowerCase() || '').includes(q)
    )
  }, [jobQuery, statusFiltered])

  // Sort
  const rows = useMemo(() => {
    const out = [...searched]
    out.sort((a, b) => {
      const da = new Date(a.last).getTime()
      const db = new Date(b.last).getTime()
      return sortAsc ? da - db : db - da
    })
    return out
  }, [searched, sortAsc])

  const statusTabBtn = (label, active) => (
    <Button
      key={label}
      variant={active ? 'primary' : 'outline'}
      onClick={() => setStatusTab(label)}
      className={active ? '' : 'border-white/20'}
    >
      {label}
      {label === 'Succeeded' && <CheckCircle2 className="w-4 h-4" />}
      {label === 'Failed' && <XCircle className="w-4 h-4" />}
      {label === 'In Queue' && <Timer className="w-4 h-4" />}
    </Button>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white grid grid-cols-12 gap-6 p-6">

      {/* Sidebar */}
      <aside className="col-span-12 md:col-span-3 xl:col-span-2 border border-white/10 rounded-2xl bg-white/5">
        <div className="p-3 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search batches…" />
          </div>
        </div>
        <nav className="p-2 space-y-1">
          {['All Batches', 'New Connection', 'Justification', 'Prospection', 'HR'].map((label) => {
            const active = category === label
            return (
              <button
                key={label}
                onClick={() => setCategory(label)}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm transition
                ${active ? 'bg-white/12 border border-white/20' : 'hover:bg-white/10 border border-transparent'}`}
              >
                {label}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Main Panel */}
      <section className="col-span-12 md:col-span-9 xl:col-span-10 space-y-4">

        {/* Tabs + Controls */}
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              {/* Primary Tabs (visual only per spec; Job Details active) */}
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 text-xs rounded-lg bg-white/10 border border-white/10">Batch Summary</span>
                <span className="px-3 py-1 text-xs rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-300">Job Details</span>
              </div>

              {/* Secondary Tabs (status filters) */}
              <div className="flex items-center gap-1 ml-2">
                {statusTabBtn('Exported Jobs', statusTab === 'Exported Jobs')}
                {statusTabBtn('Succeeded', statusTab === 'Succeeded')}
                {statusTabBtn('In Queue', statusTab === 'In Queue')}
                {statusTabBtn('Failed', statusTab === 'Failed')}
              </div>

              {/* Controls Right */}
              <div className="ml-auto flex items-center gap-2">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input type="text" defaultValue="Aug 17, 2025 – Aug 24, 2025" className="w-56 pl-9" />
                </div>
                <select className="h-10 rounded-xl bg-black/20 border border-white/10 px-3 text-sm">
                  <option>Batch instances</option>
                  <option>Match single</option>
                </select>
                <Button variant="outline" onClick={() => setSortAsc(s => !s)}>
                  Sort {sortAsc ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
                <div className="relative w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search jobs…"
                    className="pl-9"
                    value={jobQuery}
                    onChange={e => setJobQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Job Details</h3>
            <span className="text-xs text-gray-400">Showing {rows.length} records</span>
          </CardHeader>

          <CardContent>
            {/* Column headers (hidden on small screens) */}
            <div className="hidden md:grid grid-cols-12 gap-3 px-3 py-2 text-xs text-gray-400">
              <div className="col-span-3">Job</div>
              <div className="col-span-2">Document Library</div>
              <div className="col-span-1">Pages</div>
              <div className="col-span-3">Last Exported</div>
              <div className="col-span-2">Exported Location</div>
              <div className="col-span-1 text-right">Status</div>
            </div>

            <div className="space-y-2">
              {rows.map((r) => (
                <div
                  key={r.name + r.last}
                  className="grid grid-cols-12 items-center gap-3 p-3 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition"
                >
                  {/* Job + desc */}
                  <div className="col-span-12 md:col-span-3">
                    <div className="font-medium text-white truncate">{r.name}</div>
                    <div className="text-xs text-gray-400 truncate">{r.desc}</div>
                  </div>

                  {/* Library */}
                  <div className="col-span-6 md:col-span-2 text-sm truncate">{r.lib}</div>

                  {/* Pages */}
                  <div className="col-span-6 md:col-span-1 text-sm">{r.pages}</div>

                  {/* Last */}
                  <div className="col-span-6 md:col-span-3 text-xs">{r.last}</div>

                  {/* Path */}
                  <div className="col-span-6 md:col-span-2 text-xs truncate">
                    <a className="underline text-cyan-400" href={r.path}>{r.path}</a>
                  </div>

                  {/* Status (right-aligned on md+) */}
                  <div className="col-span-12 md:col-span-1 md:text-right">
                    {r.status === 'Succeeded' && <Badge color="green">Succeeded</Badge>}
                    {r.status === 'Failed'    && <Badge color="red">Failed</Badge>}
                    {r.status === 'In Queue'  && <Badge color="amber">In Queue</Badge>}
                  </div>

                  {/* Sparkline row (full width) */}
                  <div className="col-span-12">
                    <div className="h-12">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={r.trend}>
                          <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 12, color: '#F9FAFB' }} />
                          <Line type="monotone" dataKey="y" strokeWidth={2} stroke="#3B82F6" dot={false} />
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
          <Button onClick={() => exportRowsToPDF(rows)}>
            <Download className="w-4 h-4" /> Export to PDF
          </Button>
          <Button onClick={() => exportRowsToCSV(rows)}>
            <Download className="w-4 h-4" /> Export to Excel
          </Button>
          <Button variant="outline" className="ml-auto" onClick={onBack}>Back to Dashboard</Button>
        </div>
      </section>
    </div>
  )
}
