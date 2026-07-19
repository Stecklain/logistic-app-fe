import type { Ruta } from '../types/domain'
import { apiFetch } from './api'

export interface GenerateRutaPayload {
  fecha: string
  origenTexto: string
}

export async function listRutas(fecha?: string) {
  const suffix = fecha ? `?fecha=${encodeURIComponent(fecha)}` : ''
  return apiFetch<Ruta[]>(`/api/rutas${suffix}`)
}

export async function getRutaById(id: string) {
  return apiFetch<Ruta>(`/api/rutas/${id}`)
}

export async function generateRuta(payload: GenerateRutaPayload) {
  return apiFetch<Ruta[]>('/api/rutas/generar', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
