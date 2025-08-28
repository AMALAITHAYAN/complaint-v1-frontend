import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

// Keep existing instance & config intact
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // unchanged
  withCredentials: false, // JWT in header, no cookies
})

// helper: detect if request is an auth route
function isAuthRoute(url?: string) {
  if (!url) return false
  return (
    url.includes('/api/auth/login') ||
    url.includes('/api/auth/register') ||
    url.includes('/api/auth/refresh-token')
  )
}

// attach JWT (skip for auth endpoints)
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (!isAuthRoute(config.url)) {
    // Backward compatibility: support both 'token' and legacy 'jwt'
    const token = localStorage.getItem('token') || localStorage.getItem('jwt')
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// refresh on 401 then retry once
let refreshing = false
let queue: Array<() => void> = []

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as any

    if (error.response?.status === 401 && !original?._retry) {
      if (refreshing) {
        await new Promise<void>((res) => queue.push(res))
      } else {
        refreshing = true
        try {
          const refreshToken = localStorage.getItem('refreshToken')
          if (!refreshToken) throw new Error('no refresh token')

          // important: use raw axios here to avoid interceptor recursion
          const { data } = await axios.post<{ token: string }>(
            `${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh-token`,
            { refreshToken }
          )

          localStorage.setItem('token', data.token)
          // Optional: keep legacy key in sync
          localStorage.setItem('jwt', data.token)
        } catch {
          // logout fallback
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('username')
          localStorage.removeItem('roles')
          localStorage.removeItem('jwt')
          window.location.href = '/'
          throw error
        } finally {
          refreshing = false
          queue.forEach((fn) => fn())
          queue = []
        }
      }

      original._retry = true
      original.headers = original.headers || {}
      original.headers.Authorization = `Bearer ${localStorage.getItem('token') || localStorage.getItem('jwt')}`
      return api(original)
    }

    throw error
  }
)

// Export default to preserve existing imports, and named export for new imports
export { api }
export default api
