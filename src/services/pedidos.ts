import type {
  PaginatedResponse,
  Pedido,
  PedidoEstado,
  PedidoReporte,
  PedidosPendientesPorFecha,
} from '../types/domain'
import { apiFetch } from './api'

export interface PedidoFilters {
  estado?: PedidoEstado | ''
  localidad?: string
  codigoTracking?: string
  page?: number
  pageSize?: number
}

export interface PedidoPayload {
  direccionDestino: string
  localidad: string
  fechaEntrega: string
  lat?: number | null
  lng?: number | null
}

export async function listPedidos(filters: PedidoFilters) {
  const params = new URLSearchParams()
  if (filters.estado) params.set('estado', filters.estado)
  if (filters.localidad) params.set('localidad', filters.localidad)
  if (filters.codigoTracking) params.set('codigoTracking', filters.codigoTracking)
  params.set('page', String(filters.page ?? 1))
  params.set('pageSize', String(filters.pageSize ?? 20))

  return apiFetch<PaginatedResponse<Pedido>>(`/api/pedidos?${params.toString()}`)
}

export async function getPedido(id: string) {
  return apiFetch<Pedido>(`/api/pedidos/${id}`)
}

export interface PendientesPorFechaFilters {
  desde: string
  hasta: string
}

export async function getPedidosPendientesPorFecha(filters: PendientesPorFechaFilters) {
  const params = new URLSearchParams({ desde: filters.desde, hasta: filters.hasta })
  return apiFetch<PedidosPendientesPorFecha[]>(`/api/pedidos/pendientes-por-fecha?${params.toString()}`)
}

export interface PedidoReporteFilters {
  anio?: number
  mes?: number
}

export async function getPedidoReporte(filters: PedidoReporteFilters = {}) {
  const params = new URLSearchParams()
  if (filters.anio) params.set('anio', String(filters.anio))
  if (filters.mes) params.set('mes', String(filters.mes))

  const query = params.toString()
  return apiFetch<PedidoReporte>(`/api/pedidos/reporte${query ? `?${query}` : ''}`)
}

export async function createPedido(payload: PedidoPayload) {
  return apiFetch<Pedido>('/api/pedidos', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updatePedido(id: string, payload: Partial<PedidoPayload>) {
  return apiFetch<Pedido>(`/api/pedidos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function deletePedido(id: string) {
  return apiFetch<void>(`/api/pedidos/${id}`, {
    method: 'DELETE',
  })
}

export async function updatePedidoEstado(id: string, estado: PedidoEstado) {
  return apiFetch<Pedido>(`/api/pedidos/${id}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ estado }),
  })
}
