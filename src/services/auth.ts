import { apiFetch } from './api'
import type { AuthUser, LoginResponse } from '../types/domain'

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    return apiFetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  saveSession(token: string, user: AuthUser) {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
  },

  getToken(): string | null {
    return localStorage.getItem('token')
  },

  getCurrentUser(): AuthUser | null {
    const raw = localStorage.getItem('user')
    return raw ? (JSON.parse(raw) as AuthUser) : null
  },

  getRole(): string | null {
    return authService.getCurrentUser()?.role ?? null
  },

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token')
  },
}
