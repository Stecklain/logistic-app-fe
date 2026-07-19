export type UserRole = 'admin' | 'logistica'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
}

export interface ManagedUser {
  id: string
  email: string
  role: UserRole
  active: boolean
  createdAt: string
}

export interface LoginResponse {
  token: string
  user: AuthUser
}

export type PedidoEstado = 'pendiente' | 'en_ruta' | 'entregado' | 'cancelado'

export interface Pedido {
  id: string
  codigoTracking: string
  direccionDestino: string
  localidad: string
  lat: number | null
  lng: number | null
  estado: PedidoEstado
  fechaEntrega: string
  origenAlta: 'manual' | 'api_externa'
  createdAt: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface RutaPedido {
  id: string
  pedidoId: string
  ordenVisita: number
  distanciaMetros: number
  duracionSegundos: number
  pedido: Pedido
}

export interface Ruta {
  id: string
  fecha: string
  estado: 'planificada' | 'en_curso' | 'cerrada'
  zona: string | null
  origenTexto: string
  origenLat: number
  origenLng: number
  routeGeometryJson: string | null
  createdAt: string
  rutaPedidos: RutaPedido[]
}

export interface TrackingResponse {
  codigoTracking: string
  estado: PedidoEstado
  fechaEntrega: string
}

export interface PedidosPendientesPorFecha {
  fecha: string
  total: number
}

export interface PedidoReporte {
  porLocalidadYMes: Array<{ localidad: string; mes: string; total: number }>
  porEstado: Array<{ estado: PedidoEstado; total: number }>
  porEstadoYMes: Array<{ estado: PedidoEstado; mes: string; total: number }>
}
