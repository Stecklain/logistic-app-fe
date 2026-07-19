import type { ManagedUser, PaginatedResponse, UserRole } from '../types/domain'
import { apiFetch } from './api'

export interface CreateUserPayload {
  email: string
  password: string
  role: UserRole
}

export interface UserFilters {
  email?: string
  role?: UserRole | ''
  active?: boolean | ''
  page?: number
  pageSize?: number
}

export async function listUsers(filters: UserFilters = {}) {
  const params = new URLSearchParams()
  if (filters.email) params.set('email', filters.email)
  if (filters.role) params.set('role', filters.role)
  if (filters.active !== '' && filters.active !== undefined) {
    params.set('active', String(filters.active))
  }
  params.set('page', String(filters.page ?? 1))
  params.set('pageSize', String(filters.pageSize ?? 20))

  return apiFetch<PaginatedResponse<ManagedUser>>(`/api/users?${params.toString()}`)
}

export async function createUser(payload: CreateUserPayload) {
  return apiFetch<ManagedUser>('/api/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateUserEmail(id: string, email: string) {
  return apiFetch<ManagedUser>(`/api/users/${id}/email`, {
    method: 'PUT',
    body: JSON.stringify({ email }),
  })
}

export async function updateUserRoleActive(
  id: string,
  payload: { role?: UserRole; active?: boolean }
) {
  return apiFetch<ManagedUser>(`/api/users/${id}/role-active`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function adminSetPassword(id: string, password: string) {
  return apiFetch<ManagedUser>(`/api/users/${id}/password`, {
    method: 'PUT',
    body: JSON.stringify({ password }),
  })
}

export async function changeOwnPassword(currentPassword: string, newPassword: string) {
  return apiFetch<ManagedUser>('/api/users/me/password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
  })
}
