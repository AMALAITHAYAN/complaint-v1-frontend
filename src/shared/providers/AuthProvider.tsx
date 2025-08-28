import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import api from '@/shared/api/axios'
import { Role, LoginRequest, LoginResponse, loginApi, refreshTokenApi } from '@/shared/api/auth'

type AuthState = {
  isAuthenticated: boolean
  username?: string
  roles: Role[]
  token?: string
  refreshToken?: string
}

type AuthContextType = AuthState & {
  login: (values: LoginRequest) => Promise<Role | null>
  logout: () => void
  hasRole: (role: Role) => boolean
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()

  const [state, setState] = useState<AuthState>(() => {
    const token = localStorage.getItem('token') || undefined
    const refreshToken = localStorage.getItem('refreshToken') || undefined
    const username = localStorage.getItem('username') || undefined
    const roles = (localStorage.getItem('roles')?.split(',') as Role[]) || []
    return { isAuthenticated: !!token, token, refreshToken, username, roles }
  })

  useEffect(() => {
    if (state.token) api.defaults.headers.common.Authorization = `Bearer ${state.token}`
    else delete api.defaults.headers.common.Authorization
  }, [state.token])

  const login = async (values: LoginRequest): Promise<Role | null> => {
    const res: LoginResponse = await loginApi(values)
    const roles: Role[] = res.roles || []
    const primaryRole: Role | null = roles[0] || null

    setState({
      isAuthenticated: true,
      token: res.token,
      refreshToken: res.refreshToken,
      username: res.username,
      roles,
    })

    localStorage.setItem('token', res.token)
    if (res.refreshToken) localStorage.setItem('refreshToken', res.refreshToken)
    localStorage.setItem('username', res.username)
    localStorage.setItem('roles', roles.join(','))

    return primaryRole
  }

  const logout = () => {
    setState({ isAuthenticated: false, roles: [] })
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('username')
    localStorage.removeItem('roles')
    // redirect to login/root
    navigate({ to: '/', replace: true })
  }

  const hasRole = (role: Role) => state.roles.includes(role)

  const refresh = async () => {
    if (!state.refreshToken) return
    const { token } = await refreshTokenApi(state.refreshToken)
    setState(s => ({ ...s, token }))
    localStorage.setItem('token', token)
  }

  const value = useMemo<AuthContextType>(() => ({
    ...state, login, logout, hasRole, refresh
  }), [state])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
