import type { PedidoEstado } from '../types/domain'

export const ESTADO_LABELS: Record<PedidoEstado, string> = {
  pendiente: 'Pendiente',
  en_ruta: 'En Ruta',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

// entregado/cancelado usan la paleta de "estado" fija (good/critical) del sistema de
// diseño; pendiente es neutral (no representa buen/mal estado) y en_ruta usa warning.
export const ESTADO_COLORS: Record<PedidoEstado, { bg: string; fg: string }> = {
  pendiente: { bg: '#e4ebfb', fg: '#2c4a9e' },
  en_ruta: { bg: '#fff1d6', fg: '#8a5200' },
  entregado: { bg: '#e1f5e1', fg: '#0ca30c' },
  cancelado: { bg: '#fbe3e0', fg: '#d03b3b' },
}

// Debe mantenerse en sync con PEDIDO_TRANSICIONES en logistic-app-be/src/constants/pedido.ts
export const ESTADO_TRANSICIONES: Record<PedidoEstado, PedidoEstado[]> = {
  pendiente: ['en_ruta', 'entregado', 'cancelado'],
  en_ruta: ['entregado', 'cancelado'],
  entregado: [],
  cancelado: [],
}
