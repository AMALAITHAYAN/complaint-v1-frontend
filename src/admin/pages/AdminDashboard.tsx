import React, { useState, useEffect } from 'react'
import { 
  FileText, Eye, CheckCircle, Upload, XCircle, BarChart3, Users, UserX, 
  Calendar, Download, Archive, Clock, AlertTriangle, Shield, Lock, 
  Trash2, RefreshCw, Globe, Server, Database, HardDrive, Zap, Award,
  FileCheck, FilePlus, FileX, User, Search, Filter, TrendingUp, MoreHorizontal,
  ChevronRight, Activity, FileDown, Printer, Share, Settings
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, AreaChart, Area } from 'recharts'

export default function DMSDashboard() {
  const [dateRange, setDateRange] = useState('last30days')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredDocuments, setFilteredDocuments] = useState([])
  const [showDropdown, setShowDropdown] = useState(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Core dashboard metrics
  const dashboardData = {
    totalDocuments: 45680,
    uploadedDocs: 1200,
    indexed: 960,
    inQA: 80,
    exported: 650,
    failedToExport: 7850,
    totalPages: 10740,
    
    // User metrics
    totalUsers: 545,
    activeUsers: 350,
    inactiveUsers: 120,
    notLoggedInUsers: 75,
    
    // System metrics
    storageUsed: 2.4,
    storageTotal: 10,
    systemUptime: 99.8,
    pendingApproval: 145,
    securityViolations: 89,
    avgProcessingTime: 2.3,
    
    // Additional metrics
    approvedDocs: 8940,
    rejectedDocs: 234,
    archivedDocs: 2340,
    totalDownloads: 15670,
    avgUploadSpeed: 12.5,
    avgSearchTime: 0.8
  }

  // Chart data
  const documentStatusData = [
    { name: 'Approved', value: 8940, color: '#10B981' },
    { name: 'Pending', value: 145, color: '#F59E0B' },
    { name: 'Rejected', value: 234, color: '#EF4444' },
    { name: 'In Review', value: 80, color: '#3B82F6' }
  ]

  const departmentData = [
    { name: 'HR', value: 4500, color: '#06B6D4' },
    { name: 'Finance', value: 3800, color: '#8B5CF6' },
    { name: 'IT', value: 8200, color: '#10B981' },
    { name: 'Operations', value: 6100, color: '#F59E0B' },
    { name: 'Sales', value: 5000, color: '#EF4444' }
  ]

  const trendData = [
    { month: 'Jan', uploads: 400, exports: 240 },
    { month: 'Feb', uploads: 300, exports: 139 },
    { month: 'Mar', uploads: 500, exports: 380 },
    { month: 'Apr', uploads: 278, exports: 390 },
    { month: 'May', uploads: 189, exports: 480 },
    { month: 'Jun', uploads: 239, exports: 380 }
  ]

  // Full document list for filtering
  const allDocuments = [
    {
      id: 'DOC-2024-001',
      title: 'Employee Handbook 2024',
      owner: 'Alice Johnson',
      department: 'hr',
      status: 'Approved',
      priority: 'High',
      modified: '2024-08-25',
      size: '2.4 MB',
      pages: 45
    },
    {
      id: 'DOC-2024-002',
      title: 'Q3 Financial Analysis Report',
      owner: 'Bob Chen',
      department: 'finance',
      status: 'In Review',
      priority: 'Critical',
      modified: '2024-08-24',
      size: '5.7 MB',
      pages: 78
    },
    {
      id: 'DOC-2024-003',
      title: 'Network Security Protocol V4',
      owner: 'Charlie Wilson',
      department: 'it',
      status: 'Under Review',
      priority: 'High',
      modified: '2024-08-23',
      size: '1.8 MB',
      pages: 32
    },
    {
      id: 'DOC-2024-004',
      title: 'Operations Workflow Manual',
      owner: 'Diana Martinez',
      department: 'operations',
      status: 'Exported',
      priority: 'Medium',
      modified: '2024-08-22',
      size: '8.3 MB',
      pages: 156
    },
    {
      id: 'DOC-2024-005',
      title: 'Sales Training Materials',
      owner: 'Eva Thompson',
      department: 'sales',
      status: 'Approved',
      priority: 'Low',
      modified: '2024-08-21',
      size: '3.2 MB',
      pages: 67
    },
    {
      id: 'DOC-2024-006',
      title: 'IT Infrastructure Report',
      owner: 'Frank Rodriguez',
      department: 'it',
      status: 'Pending',
      priority: 'High',
      modified: '2024-08-20',
      size: '4.1 MB',
      pages: 89
    }
  ]

  // Filter documents based on current filters
  useEffect(() => {
    let filtered = allDocuments

    // Filter by department
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(doc => doc.department === departmentFilter)
    }

    // Filter by status
    if (statusFilter !== 'all') {
      const statusMap = {
        'approved': ['Approved', 'Exported'],
        'pending': ['Pending', 'In Review', 'Under Review'],
        'review': ['In Review', 'Under Review']
      }
      if (statusMap[statusFilter]) {
        filtered = filtered.filter(doc => statusMap[statusFilter].includes(doc.status))
      }
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredDocuments(filtered)
  }, [departmentFilter, statusFilter, searchTerm])

  // PDF Export Function
  const exportToPDF = async () => {
    try {
      // Create a new window with the dashboard content
      const printWindow = window.open('', '_blank')
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Document Management Dashboard Report</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              background: white;
              color: black;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .metric-grid { 
              display: grid; 
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
              gap: 20px; 
              margin: 20px 0; 
            }
            .metric-card { 
              border: 1px solid #ddd; 
              padding: 15px; 
              border-radius: 8px;
              background: #f9f9f9;
            }
            .metric-title { 
              font-size: 12px; 
              color: #666; 
              margin-bottom: 5px; 
            }
            .metric-value { 
              font-size: 24px; 
              font-weight: bold; 
              color: #333;
            }
            .table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0; 
            }
            .table th, .table td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left; 
            }
            .table th { 
              background-color: #f2f2f2; 
              font-weight: bold;
            }
            .section { 
              margin: 30px 0; 
              page-break-inside: avoid;
            }
            .section h2 {
              border-bottom: 1px solid #333;
              padding-bottom: 10px;
              color: #333;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Document Management System</h1>
            <h2>Analytics & Control Center Report</h2>
            <p>Generated on: ${currentTime.toLocaleDateString()} at ${currentTime.toLocaleTimeString()}</p>
            <p>Date Range: ${dateRange.replace(/([A-Z])/g, ' $1').toLowerCase()}</p>
          </div>

          <div class="section">
            <h2>Document Processing Metrics</h2>
            <div class="metric-grid">
              <div class="metric-card">
                <div class="metric-title">Uploaded Documents</div>
                <div class="metric-value">${dashboardData.uploadedDocs.toLocaleString()}</div>
              </div>
              <div class="metric-card">
                <div class="metric-title">Indexed</div>
                <div class="metric-value">${dashboardData.indexed.toLocaleString()}</div>
              </div>
              <div class="metric-card">
                <div class="metric-title">In QA</div>
                <div class="metric-value">${dashboardData.inQA.toLocaleString()}</div>
              </div>
              <div class="metric-card">
                <div class="metric-title">Exported</div>
                <div class="metric-value">${dashboardData.exported.toLocaleString()}</div>
              </div>
              <div class="metric-card">
                <div class="metric-title">Failed to Export</div>
                <div class="metric-value">${dashboardData.failedToExport.toLocaleString()}</div>
              </div>
              <div class="metric-card">
                <div class="metric-title">Total Pages</div>
                <div class="metric-value">${dashboardData.totalPages.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>User Activity</h2>
            <div class="metric-grid">
              <div class="metric-card">
                <div class="metric-title">Active Users</div>
                <div class="metric-value">${dashboardData.activeUsers.toLocaleString()}</div>
              </div>
              <div class="metric-card">
                <div class="metric-title">Inactive Users</div>
                <div class="metric-value">${dashboardData.inactiveUsers.toLocaleString()}</div>
              </div>
              <div class="metric-card">
                <div class="metric-title">Not Logged-In Users</div>
                <div class="metric-value">${dashboardData.notLoggedInUsers.toLocaleString()}</div>
              </div>
              <div class="metric-card">
                <div class="metric-title">Total Users</div>
                <div class="metric-value">${dashboardData.totalUsers.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>System Performance</h2>
            <div class="metric-grid">
              <div class="metric-card">
                <div class="metric-title">Storage Used</div>
                <div class="metric-value">${dashboardData.storageUsed}TB / ${dashboardData.storageTotal}TB</div>
              </div>
              <div class="metric-card">
                <div class="metric-title">System Uptime</div>
                <div class="metric-value">${dashboardData.systemUptime}%</div>
              </div>
              <div class="metric-card">
                <div class="metric-title">Pending Approvals</div>
                <div class="metric-value">${dashboardData.pendingApproval.toLocaleString()}</div>
              </div>
              <div class="metric-card">
                <div class="metric-title">Avg Processing Time</div>
                <div class="metric-value">${dashboardData.avgProcessingTime} min</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Recent Documents</h2>
            <table class="table">
              <thead>
                <tr>
                  <th>Document ID</th>
                  <th>Title</th>
                  <th>Owner</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Size</th>
                  <th>Modified</th>
                </tr>
              </thead>
              <tbody>
                ${filteredDocuments.map(doc => `
                  <tr>
                    <td>${doc.id}</td>
                    <td>${doc.title}</td>
                    <td>${doc.owner}</td>
                    <td>${doc.department.toUpperCase()}</td>
                    <td>${doc.status}</td>
                    <td>${doc.priority}</td>
                    <td>${doc.size}</td>
                    <td>${doc.modified}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>Document Status Summary</h2>
            <table class="table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Count</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                ${documentStatusData.map(status => `
                  <tr>
                    <td>${status.name}</td>
                    <td>${status.value.toLocaleString()}</td>
                    <td>${((status.value / documentStatusData.reduce((sum, s) => sum + s.value, 0)) * 100).toFixed(1)}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>Department Distribution</h2>
            <table class="table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Document Count</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                ${departmentData.map(dept => `
                  <tr>
                    <td>${dept.name}</td>
                    <td>${dept.value.toLocaleString()}</td>
                    <td>${((dept.value / departmentData.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1)}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </body>
        </html>
      `
      
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      
      // Wait for content to load then print
      setTimeout(() => {
        printWindow.focus()
        printWindow.print()
      }, 500)

    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    }
  }

  const MetricCard = ({ title, value, icon: Icon, change, changeType, color = "blue", onClick }) => {
    const colorClasses = {
      blue: "from-blue-500/10 to-blue-600/10 border-blue-500/20",
      green: "from-green-500/10 to-green-600/10 border-green-500/20",
      yellow: "from-yellow-500/10 to-yellow-600/10 border-yellow-500/20",
      red: "from-red-500/10 to-red-600/10 border-red-500/20",
      purple: "from-purple-500/10 to-purple-600/10 border-purple-500/20"
    }

    const iconColors = {
      blue: "text-blue-400",
      green: "text-green-400", 
      yellow: "text-yellow-400",
      red: "text-red-400",
      purple: "text-purple-400"
    }

    return (
      <div 
        className={`relative bg-gradient-to-br ${colorClasses[color]} border rounded-2xl p-4 sm:p-5 backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden group hover:scale-105 cursor-pointer`}
        onClick={onClick}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-50"></div>
        
        {/* Icon positioned in top right */}
        <div className="absolute top-4 right-4">
          <div className={`p-2.5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 group-hover:bg-white/10 transition-all duration-300`}>
            <Icon className={`w-5 h-5 ${iconColors[color]}`} />
          </div>
        </div>
        
        <div className="relative z-10">
          {/* Title */}
          <p className="text-xs sm:text-sm font-medium text-gray-300 mb-2 pr-12">{title}</p>
          
          {/* Value */}
          <p className="text-2xl sm:text-3xl font-bold text-white mb-2 pr-12">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          
          {/* Change indicator */}
          {change && (
            <div className="flex items-center text-xs sm:text-sm">
              <span className={`font-semibold ${changeType === 'positive' ? 'text-green-400' : 'text-red-400'}`}>
                {changeType === 'positive' ? '+' : ''}{change}
              </span>
              <span className="text-gray-400 ml-1">vs yesterday</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  const getStatusBadge = (status) => {
    const statusStyles = {
      'Approved': 'bg-green-500/20 text-green-300 border-green-500/30',
      'In Review': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'Under Review': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'Exported': 'bg-green-500/20 text-green-300 border-green-500/30',
      'Pending': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'Export Failed': 'bg-red-500/20 text-red-300 border-red-500/30'
    }
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusStyles[status] || 'bg-gray-600/20 text-gray-300 border-gray-600/30'}`}>
        {status}
      </span>
    )
  }

  const getPriorityBadge = (priority) => {
    const priorityStyles = {
      'Critical': 'bg-red-500/20 text-red-300 border-red-500/30',
      'High': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      'Medium': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'Low': 'bg-green-500/20 text-green-300 border-green-500/30'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${priorityStyles[priority]}`}>
        {priority}
      </span>
    )
  }

  const handleDocumentAction = (action, docId) => {
    switch(action) {
      case 'view':
        alert(`Opening document: ${docId}`)
        break
      case 'download':
        alert(`Downloading document: ${docId}`)
        break
      case 'edit':
        alert(`Editing document: ${docId}`)
        break
      case 'delete':
        if (confirm(`Are you sure you want to delete document: ${docId}?`)) {
          alert(`Document ${docId} deleted`)
        }
        break
      default:
        break
    }
    setShowDropdown(null)
  }

  const refreshData = () => {
    alert('Refreshing dashboard data...')
    // In a real app, this would trigger a data refresh
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Main Content - Full Width */}
      <div className="relative z-10 w-full p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-3">
                Document Management
              </h1>
              <p className="text-lg sm:text-xl text-gray-300">Analytics & Control Center</p>
              <p className="text-sm text-gray-400 mt-2">
                Last updated: {currentTime.toLocaleString()}
              </p>
            </div>
            
            {/* Search and Actions */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="search"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-white placeholder-gray-400 w-64 sm:w-80 transition-all"
                />
              </div>
              <button 
                onClick={refreshData}
                className="px-4 py-3 bg-gray-700/50 hover:bg-gray-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button 
                onClick={exportToPDF}
                className="px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg flex items-center gap-2"
              >
                <FileDown className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4 sm:p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <select 
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-blue-500/50 text-white text-sm"
                >
                  <option value="today">Today</option>
                  <option value="last7days">Last 7 Days</option>
                  <option value="last30days">Last 30 Days</option>
                  <option value="last90days">Last 90 Days</option>
                </select>
              </div>
              
              <select 
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-blue-500/50 text-white text-sm"
              >
                <option value="all">All Departments</option>
                <option value="hr">Human Resources</option>
                <option value="finance">Finance</option>
                <option value="it">IT</option>
                <option value="operations">Operations</option>
                <option value="sales">Sales</option>
              </select>
              
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-blue-500/50 text-white text-sm"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="review">Under Review</option>
              </select>
              
              <div className="ml-auto flex items-center gap-2 text-sm text-gray-400">
                <Filter className="w-4 h-4" />
                <span>Results: {filteredDocuments.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Document Processing Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
          <MetricCard
            title="Uploaded Docs"
            value={dashboardData.uploadedDocs}
            icon={Upload}
            change="12%"
            changeType="positive"
            color="green"
            onClick={() => alert('Viewing uploaded documents details')}
          />
          <MetricCard
            title="Indexed"
            value={dashboardData.indexed}
            icon={Eye}
            color="blue"
            onClick={() => alert('Viewing indexed documents')}
          />
          <MetricCard
            title="In QA"
            value={dashboardData.inQA}
            icon={CheckCircle}
            color="yellow"
            onClick={() => alert('Viewing QA queue')}
          />
          <MetricCard
            title="Exported"
            value={dashboardData.exported}
            icon={Download}
            change="8%"
            changeType="positive"
            color="green"
            onClick={() => alert('Viewing exported documents')}
          />
          <MetricCard
            title="Failed to Export"
            value={dashboardData.failedToExport}
            icon={XCircle}
            change="15%"
            changeType="negative"
            color="red"
            onClick={() => alert('Viewing failed exports')}
          />
          <MetricCard
            title="Total Pages"
            value={dashboardData.totalPages}
            icon={FileText}
            color="purple"
            onClick={() => alert('Viewing page statistics')}
          />
        </div>

        {/* User Activity Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <MetricCard
            title="Active Users"
            value={dashboardData.activeUsers}
            icon={Users}
            change="5%"
            changeType="positive"
            color="green"
            onClick={() => alert('Viewing active users')}
          />
          <MetricCard
            title="Inactive Users"
            value={dashboardData.inactiveUsers}
            icon={UserX}
            color="yellow"
            onClick={() => alert('Viewing inactive users')}
          />
          <MetricCard
            title="Not Logged-In Users"
            value={dashboardData.notLoggedInUsers}
            icon={User}
            color="red"
            onClick={() => alert('Viewing not logged-in users')}
          />
          <MetricCard
            title="Total Users"
            value={dashboardData.totalUsers}
            icon={Users}
            color="blue"
            onClick={() => alert('Viewing all users')}
          />
        </div>

        {/* System Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-10">
          <MetricCard
            title="Storage Used"
            value={`${dashboardData.storageUsed}TB`}
            icon={HardDrive}
            color="yellow"
            onClick={() => alert('Viewing storage details')}
          />
          <MetricCard
            title="System Uptime"
            value={`${dashboardData.systemUptime}%`}
            icon={Server}
            color="green"
            onClick={() => alert('Viewing system status')}
          />
          <MetricCard
            title="Pending Approvals"
            value={dashboardData.pendingApproval}
            icon={AlertTriangle}
            color="yellow"
            onClick={() => alert('Viewing pending approvals')}
          />
          <MetricCard
            title="Avg Processing"
            value={`${dashboardData.avgProcessingTime}min`}
            icon={Clock}
            color="blue"
            onClick={() => alert('Viewing processing metrics')}
          />
        </div>

        {/* Charts Section - Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-10">
          {/* Document Status Chart */}
          <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4 sm:p-6 hover:bg-gray-800/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-white">Document Status</h3>
              <button 
                onClick={() => alert('Viewing detailed status breakdown')}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                Details
              </button>
            </div>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={documentStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {documentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '12px',
                      color: '#F9FAFB'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {documentStatusData.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-xs sm:text-sm">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-gray-300">{item.name}: {item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Department Distribution */}
          <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4 sm:p-6 hover:bg-gray-800/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-white">By Department</h3>
              <button 
                onClick={() => alert('Viewing department analytics')}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                Analyze
              </button>
            </div>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '12px',
                      color: '#F9FAFB'
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trends Chart */}
          <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4 sm:p-6 hover:bg-gray-800/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-white">Monthly Trends</h3>
              <button 
                onClick={() => alert('Viewing detailed trends')}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                Forecast
              </button>
            </div>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '12px',
                      color: '#F9FAFB'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="uploads" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                    name="Uploads"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="exports" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                    name="Exports"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Content Grid - Better Organization */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-10">
          {/* Recent Documents - Spans 2 columns on large screens */}
          <div className="lg:col-span-2 bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-white">Recent Documents</h3>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">Showing {filteredDocuments.length} results</span>
                <button 
                  onClick={() => alert('Viewing all documents')}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-2"
                >
                  View All <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {filteredDocuments.map((doc) => (
                <div 
                  key={doc.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-white mb-1 truncate group-hover:text-blue-300 transition-colors">{doc.title}</h4>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-400">
                        <span>{doc.owner}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="capitalize">{doc.department}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{doc.modified}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{doc.pages} pages</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {getStatusBadge(doc.status)}
                    {getPriorityBadge(doc.priority)}
                    <span className="text-xs sm:text-sm text-gray-400">{doc.size}</span>
                    <div className="relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowDropdown(showDropdown === doc.id ? null : doc.id)
                        }}
                        className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-600/30 transition-all"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {showDropdown === doc.id && (
                        <div className="absolute right-0 top-10 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50 min-w-[160px]">
                          <button 
                            onClick={() => handleDocumentAction('view', doc.id)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2 rounded-t-xl"
                          >
                            <Eye className="w-4 h-4" /> View
                          </button>
                          <button 
                            onClick={() => handleDocumentAction('download', doc.id)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" /> Download
                          </button>
                          <button 
                            onClick={() => handleDocumentAction('edit', doc.id)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4" /> Edit
                          </button>
                          <button 
                            onClick={() => handleDocumentAction('delete', doc.id)}
                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 flex items-center gap-2 rounded-b-xl"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredDocuments.length === 0 && (
                <div className="text-center py-12">
                  <FileX className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No documents found</p>
                  <p className="text-gray-500 text-sm">Try adjusting your filters or search term</p>
                </div>
              )}
            </div>
          </div>

          {/* Activity Panel */}
          <div className="space-y-4">
            {/* Quick Stats */}
            <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Today's Activity</h3>
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
              <div className="space-y-4">
                <div 
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-700/30 hover:bg-gray-700/50 transition-all cursor-pointer"
                  onClick={() => alert('Viewing upload details')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Upload className="w-4 h-4 text-green-400" />
                    </div>
                    <span className="text-gray-300 text-sm">New Uploads</span>
                  </div>
                  <span className="text-green-400 font-semibold">+24</span>
                </div>
                
                <div 
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-700/30 hover:bg-gray-700/50 transition-all cursor-pointer"
                  onClick={() => alert('Viewing approval details')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-gray-300 text-sm">Approvals</span>
                  </div>
                  <span className="text-blue-400 font-semibold">+12</span>
                </div>
                
                <div 
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-700/30 hover:bg-gray-700/50 transition-all cursor-pointer"
                  onClick={() => alert('Viewing download statistics')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Download className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="text-gray-300 text-sm">Downloads</span>
                  </div>
                  <span className="text-purple-400 font-semibold">+156</span>
                </div>

                <div 
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-700/30 hover:bg-gray-700/50 transition-all cursor-pointer"
                  onClick={() => alert('Viewing failed export details')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <XCircle className="w-4 h-4 text-red-400" />
                    </div>
                    <span className="text-gray-300 text-sm">Failed Exports</span>
                  </div>
                  <span className="text-red-400 font-semibold">+2</span>
                </div>
              </div>
            </div>

            {/* System Alerts */}
            <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">System Alerts</h3>
                <button 
                  onClick={() => alert('Viewing all system alerts')}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                <div 
                  className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all cursor-pointer"
                  onClick={() => alert('Storage warning: 76% capacity reached. Consider archiving old documents.')}
                >
                  <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <div className="text-red-300 text-sm font-medium">Storage Warning</div>
                    <div className="text-red-400/80 text-xs mt-1">76% capacity reached</div>
                  </div>
                </div>
                
                <div 
                  className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl hover:bg-yellow-500/20 transition-all cursor-pointer"
                  onClick={() => alert('45 documents are pending review. Click to view pending queue.')}
                >
                  <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-yellow-300 text-sm font-medium">Pending Reviews</div>
                    <div className="text-yellow-400/80 text-xs mt-1">45 documents awaiting</div>
                  </div>
                </div>
                
                <div 
                  className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition-all cursor-pointer"
                  onClick={() => alert('Security scan completed successfully. All systems are secure.')}
                >
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-blue-300 text-sm font-medium">Security Scan</div>
                    <div className="text-blue-400/80 text-xs mt-1">All systems secure</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => alert('Opening bulk upload interface')}
                  className="w-full flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition-all text-left"
                >
                  <Upload className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-300 text-sm font-medium">Bulk Upload</span>
                </button>
                
                <button 
                  onClick={() => alert('Opening approval queue')}
                  className="w-full flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl hover:bg-green-500/20 transition-all text-left"
                >
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-green-300 text-sm font-medium">Review Queue</span>
                </button>
                
                <button 
                  onClick={() => alert('Opening system settings')}
                  className="w-full flex items-center gap-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl hover:bg-purple-500/20 transition-all text-left"
                >
                  <Settings className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-300 text-sm font-medium">Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-400 text-sm py-6 border-t border-gray-800/50">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            <span>© 2025 Document Management System</span>
            <span className="hidden sm:inline">•</span>
            <span>Last updated: {currentTime.toLocaleString()}</span>
            <span className="hidden sm:inline">•</span>
            <button 
              onClick={() => alert('System uptime: 99.8% | Server status: Healthy')}
              className="text-green-400 hover:text-green-300 transition-colors"
            >
              System Status: Online
            </button>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setShowDropdown(null)}
        ></div>
      )}
    </div>
  )
}