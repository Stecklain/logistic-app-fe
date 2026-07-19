import type { UserRole } from '../types/domain'

export const ROLE_LABELS: Record<UserRole, string> = {
  logistica: 'Logística',
  admin: 'Admin',
}

// Colores categóricos (identidad de rol, no severidad) — distintos de la paleta
// de estado que usan los pedidos, para no mezclar los dos vocabularios de color.
export const ROLE_COLORS: Record<UserRole, { bg: string; fg: string }> = {
  logistica: { bg: '#e4ebfb', fg: '#2a4ea3' },
  admin: { bg: '#efe9fb', fg: '#4a3aa7' },
}
