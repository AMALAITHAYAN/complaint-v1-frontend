import api from './axios'

export type Role = 'ROLE_ADMIN' | 'ROLE_SCANNER' | 'ROLE_REVIEWER' | 'ROLE_VIEWER'

export interface LoginRequest { username: string; password: string }
export interface RegisterRequest extends LoginRequest { roles: Role[] }

export interface LoginResponse {
  token: string
  refreshToken?: string
  username: string
  roles: Role[]                 // e.g. ["ROLE_ADMIN"]
}

export async function loginApi(body: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/api/auth/login', body)
  return data
}

export async function registerApi(body: RegisterRequest): Promise<void> {
  await api.post('/api/auth/register', body)
}

export async function refreshTokenApi(refreshToken: string): Promise<{ token: string }> {
  const { data } = await api.post('/api/auth/refresh-token', { refreshToken })
  return data
}
