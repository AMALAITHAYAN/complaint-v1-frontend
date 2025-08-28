import React, { useEffect } from 'react'
import { useAuth } from '@/shared/providers/AuthProvider'
import { useNavigate } from '@tanstack/react-router'

export default function ViewerDashboard() {
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  useEffect(() => {
    if (!isAuthenticated) navigate({ to: '/' })
  }, [isAuthenticated, navigate])
  if (!isAuthenticated) return null
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold">Viewer Dashboard</h2>
      <button onClick={logout} className="border rounded px-3 py-1 mt-3">Logout</button>
    </div>
  )
}
