import React, { useEffect } from 'react'
import { useAuth } from '@/shared/providers/AuthProvider'
import { useNavigate } from '@tanstack/react-router'

export default function ReviewerDashboard() {
  const { isAuthenticated, roles, logout } = useAuth()
  const navigate = useNavigate()
  useEffect(() => {
    if (!isAuthenticated) navigate({ to: '/' })
    else if (!roles.includes('ROLE_REVIEWER')) navigate({ to: '/viewer' })
  }, [isAuthenticated, roles, navigate])
  if (!isAuthenticated) return null
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold">Reviewer Dashboard</h2>
      <button onClick={logout} className="border rounded px-3 py-1 mt-3">Logout</button>
    </div>
  )
}
