const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export interface LoginResponse {
  token: string
  user: { id: string; email: string }
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Error al iniciar sesión')
    return data
  },

  saveSession(token: string) {
    localStorage.setItem('token', token)
  },

  getToken(): string | null {
    return localStorage.getItem('token')
  },

  logout() {
    localStorage.removeItem('token')
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token')
  },
}
