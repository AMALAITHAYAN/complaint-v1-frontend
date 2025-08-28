import React from 'react'
import { Link, Outlet, useRouterState } from '@tanstack/react-router'
import { useAuth } from '@/shared/providers/AuthProvider'
import { LayoutDashboard, FileType, History, LogOut, Shield, User, Boxes } from 'lucide-react'

export default function StyledAdminLayout() {
  const { logout, roles, isAuthenticated } = useAuth()
  const { location } = useRouterState()

  if (!isAuthenticated || !roles.includes('ROLE_ADMIN')) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-red-400">
        <div className="bg-red-500/10 border border-red-500/30 px-6 py-4 rounded-xl flex items-center gap-3">
          <Shield className="w-6 h-6" />
          <span>Unauthorized Access</span>
        </div>
      </div>
    )
  }

  const isActive = (path: string) =>
    location.href === path || location.href.startsWith(path + '/')

  return (
    <div className="min-h-screen flex bg-slate-900 text-gray-100">
      <aside className="fixed left-0 top-0 w-72 h-screen bg-gray-800/40 backdrop-blur-xl border-r border-gray-700/50 z-10 flex flex-col">
        <div className="px-6 py-6 border-b border-gray-700/50">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-xl flex items-center justify-center mr-3">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Admin Panel</h1>
              <p className="text-xs text-gray-400">Document Management</p>
            </div>
          </div>
        </div>

        <nav className="px-4 py-6 space-y-3 flex-1 overflow-hidden">
          <Link
            to="/admin"
            className={`flex items-center px-4 py-3 rounded-xl transition ${
              isActive('/admin') && location.href === '/admin'
                ? 'bg-purple-600/20 border border-purple-500/30'
                : 'hover:bg-gray-700/50'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/admin/document-types"
            className={`flex items-center px-4 py-3 rounded-xl transition ${
              isActive('/admin/document-types')
                ? 'bg-purple-600/20 border border-purple-500/30'
                : 'hover:bg-gray-700/50'
            }`}
          >
            <FileType className="w-5 h-5 mr-3" />
            <span>Document Types</span>
          </Link>

          {/* ✅ New: Batches */}
          <Link
            to="/admin/batches"
            className={`flex items-center px-4 py-3 rounded-xl transition ${
              isActive('/admin/batches')
                ? 'bg-purple-600/20 border border-purple-500/30'
                : 'hover:bg-gray-700/50'
            }`}
          >
            <Boxes className="w-5 h-5 mr-3" />
            <span>Batches</span>
          </Link>

          {/* Restore tab (correct path) */}
          <Link
            to="/admin/document-types/restore"
            className={`flex items-center px-4 py-3 rounded-xl transition ${
              isActive('/admin/document-types/restore')
                ? 'bg-purple-600/20 border border-purple-500/30'
                : 'hover:bg-gray-700/50'
            }`}
          >
            <History className="w-5 h-5 mr-3" />
            <span>Restore</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-700/50">
          <div className="flex items-center mb-4 px-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mr-3">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium">Administrator</p>
              <p className="text-xs text-gray-400">Full Access</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl transition"
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="ml-72 flex-1 bg-gray-100/5 min-h-screen overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
